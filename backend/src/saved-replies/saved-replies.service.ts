import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type SavedReplyInput = { title: string; text: string };

// Ready answers for the booking conversations (Admin > Settings > Saved replies)
@Injectable()
export class SavedRepliesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.savedReply.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, title: true, text: true },
    });
  }

  create(input: SavedReplyInput) {
    return this.prisma.savedReply.create({
      data: { title: input.title.trim(), text: input.text.trim() },
      select: { id: true, title: true, text: true },
    });
  }

  async update(id: string, input: SavedReplyInput) {
    await this.exists(id);
    return this.prisma.savedReply.update({
      where: { id },
      data: { title: input.title.trim(), text: input.text.trim() },
      select: { id: true, title: true, text: true },
    });
  }

  async remove(id: string) {
    await this.exists(id);
    await this.prisma.savedReply.delete({ where: { id } });
    return { id };
  }

  private async exists(id: string) {
    const found = await this.prisma.savedReply.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('This saved reply does not exist');
  }
}
