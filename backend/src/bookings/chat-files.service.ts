import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { safeFileName } from '../common/file-name';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { BookingsService, type ChatAttachment } from './bookings.service';
import { BookingMessageDto } from './dto/booking.dto';

// Files in the booking chat: photos and documents the customer and the team send each other.
// They are kept in a PRIVATE bucket (CHAT_BUCKET, default "chat"): only the customer's link
// and logged-in admins can open them, never the public /api/files route.
//   bookings/<bookingId>/<random>.jpg

export const MAX_CHAT_FILE = 10 * 1024 * 1024; // 10 MB

type Kind = {
  type: string; // the Content-Type we serve it with (the browser's claim is not trusted)
  inline: boolean; // opened in the browser (images, PDF) or downloaded
  check: (b: Buffer) => boolean; // the file's first bytes must match
};

const starts = (b: Buffer, ...bytes: number[]) =>
  bytes.every((x, i) => b[i] === x);
const text = (b: Buffer, at: number, s: string) =>
  b.subarray(at, at + s.length).toString('latin1') === s;
const zip = (b: Buffer) => starts(b, 0x50, 0x4b, 0x03, 0x04); // docx, xlsx, pptx, zip
const ole = (b: Buffer) =>
  starts(b, 0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1); // old doc, xls, ppt
const plain = (b: Buffer) => !b.subarray(0, 4096).includes(0); // text: no NUL bytes

const IMAGES: Record<string, Kind> = {
  '.jpg': {
    type: 'image/jpeg',
    inline: true,
    check: (b) => starts(b, 0xff, 0xd8, 0xff),
  },
  '.jpeg': {
    type: 'image/jpeg',
    inline: true,
    check: (b) => starts(b, 0xff, 0xd8, 0xff),
  },
  '.png': {
    type: 'image/png',
    inline: true,
    check: (b) => starts(b, 0x89, 0x50, 0x4e, 0x47),
  },
  '.gif': { type: 'image/gif', inline: true, check: (b) => text(b, 0, 'GIF8') },
  '.webp': {
    type: 'image/webp',
    inline: true,
    check: (b) => text(b, 0, 'RIFF') && text(b, 8, 'WEBP'),
  },
  // iPhone photos: browsers cannot show them, so they are downloaded
  '.heic': {
    type: 'image/heic',
    inline: false,
    check: (b) => text(b, 4, 'ftyp'),
  },
  '.heif': {
    type: 'image/heif',
    inline: false,
    check: (b) => text(b, 4, 'ftyp'),
  },
};
const PDF: Record<string, Kind> = {
  '.pdf': {
    type: 'application/pdf',
    inline: true,
    check: (b) => text(b, 0, '%PDF-'),
  },
};
const DOCUMENTS: Record<string, Kind> = {
  '.docx': {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    inline: false,
    check: zip,
  },
  '.xlsx': {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    inline: false,
    check: zip,
  },
  '.pptx': {
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    inline: false,
    check: zip,
  },
  '.zip': { type: 'application/zip', inline: false, check: zip },
  '.doc': { type: 'application/msword', inline: false, check: ole },
  '.xls': { type: 'application/vnd.ms-excel', inline: false, check: ole },
  '.ppt': { type: 'application/vnd.ms-powerpoint', inline: false, check: ole },
  '.txt': { type: 'text/plain; charset=utf-8', inline: false, check: plain },
  '.csv': { type: 'text/csv; charset=utf-8', inline: false, check: plain },
};

// Customers send photos and PDFs; the team can also send office documents
const CUSTOMER_KINDS = { ...IMAGES, ...PDF };
const TEAM_KINDS = { ...IMAGES, ...PDF, ...DOCUMENTS };
const ALL_KINDS: Record<string, Kind> = TEAM_KINDS;

// Our own file names: "<uuid>.<ext>"
const KEY = /^[0-9a-f-]{36}\.[a-z0-9]{2,5}$/;

@Injectable()
export class ChatFilesService {
  private readonly logger = new Logger(ChatFilesService.name);
  private readonly bucket: string;

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private bookings: BookingsService,
    config: ConfigService,
  ) {
    this.bucket = (config.get<string>('CHAT_BUCKET') ?? 'chat').trim();
    // A deleted booking takes its chat files with it
    bookings.onRemoved((id) => void this.removeAll(id));
  }

  // ---------- Sending ----------

  async customerFile(
    token: string,
    file: Express.Multer.File | undefined,
    dto: BookingMessageDto,
  ) {
    const bookingId = await this.bookings.openChatByToken(token);
    const attachment = await this.save(bookingId, file, CUSTOMER_KINDS);
    return this.orRemove(bookingId, attachment, () =>
      this.bookings.customerMessage(token, dto, [attachment]),
    );
  }

  async teamFile(
    id: string,
    file: Express.Multer.File | undefined,
    dto: BookingMessageDto,
    authorName: string,
  ) {
    const bookingId = await this.bookings.openChat(id);
    const attachment = await this.save(bookingId, file, TEAM_KINDS);
    return this.orRemove(bookingId, attachment, () =>
      this.bookings.teamMessage(id, dto, authorName, [attachment]),
    );
  }

  // The team sends a package's quotation PDF (already public: anyone can ask for it on the website)
  async teamQuotation(
    id: string,
    packageId: string,
    dto: BookingMessageDto,
    authorName: string,
  ) {
    const pkg = await this.prisma.package.findUnique({
      where: { id: packageId },
      select: { title: true, quotation: true },
    });
    if (!pkg?.quotation) {
      throw new BadRequestException('This package has no quotation PDF yet');
    }
    return this.bookings.teamMessage(id, dto, authorName, [
      {
        name: `${safeFileName(pkg.title)} - Quotation.pdf`,
        type: 'application/pdf',
        size: 0,
        url: pkg.quotation,
      },
    ]);
  }

  // ---------- Reading ----------

  async customerDownload(token: string, key: string) {
    return this.download(await this.bookings.bookingIdByToken(token), key);
  }

  // (the admin route checks the login; the booking must exist and own the file)
  async download(bookingId: string, key: string) {
    if (!KEY.test(key)) throw new NotFoundException('File not found');
    const message = await this.prisma.bookingMessage.findFirst({
      where: {
        bookingId,
        attachments: { array_contains: [{ key }] },
      },
      select: { attachments: true },
    });
    const attachment = (
      (message?.attachments ?? []) as unknown as ChatAttachment[]
    ).find((a) => a.key === key);
    if (!attachment) throw new NotFoundException('File not found');

    const file = await this.storage.streamPrivate(
      this.bucket,
      `bookings/${bookingId}/${key}`,
    );
    const kind = ALL_KINDS[extname(key)];
    const name = safeFileName(attachment.name);
    return {
      stream: file.stream,
      type: kind?.type ?? 'application/octet-stream',
      disposition: `${kind?.inline ? 'inline' : 'attachment'}; filename="${name}"`,
    };
  }

  // ---------- Helpers ----------

  private async save(
    bookingId: string,
    file: Express.Multer.File | undefined,
    kinds: Record<string, Kind>,
  ): Promise<ChatAttachment> {
    if (!file) throw new BadRequestException('Send the file in a "file" field');
    const extension = extname(file.originalname).toLowerCase();
    const kind = kinds[extension];
    if (!kind) {
      const allowed = Object.keys(kinds).join(', ');
      throw new BadRequestException(
        `This type of file cannot be sent. Allowed: ${allowed}`,
      );
    }
    if (!kind.check(file.buffer)) {
      throw new BadRequestException(
        `This file is not a real ${extension} file`,
      );
    }
    const key = `${randomUUID()}${extension === '.jpeg' ? '.jpg' : extension}`;
    await this.storage.putPrivate(
      this.bucket,
      `bookings/${bookingId}/${key}`,
      file.buffer,
      kind.type,
    );
    return {
      name: file.originalname.slice(0, 120),
      type: kind.type,
      size: file.size,
      key,
    };
  }

  // The message could not be saved (e.g. too many messages): the file goes too
  private async orRemove<T>(
    bookingId: string,
    attachment: ChatAttachment,
    send: () => Promise<T>,
  ) {
    try {
      return await send();
    } catch (error) {
      await this.storage
        .deletePrivate(this.bucket, `bookings/${bookingId}/${attachment.key}`)
        .catch(() => {});
      throw error;
    }
  }

  private async removeAll(bookingId: string) {
    if (!this.storage.configured) return;
    try {
      const files = await this.storage.listPrivate(
        this.bucket,
        `bookings/${bookingId}/`,
      );
      for (const f of files)
        await this.storage.deletePrivate(this.bucket, f.key);
    } catch (error) {
      this.logger.warn(
        `Could not delete the chat files of booking ${bookingId}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
}
