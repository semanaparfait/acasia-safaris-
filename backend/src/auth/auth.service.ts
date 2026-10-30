import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ChangePasswordDto, UpdateAccountDto } from './dto/account.dto';

// What is stored inside the login token. sub = worker id (UUID), v = the worker's
// tokenVersion when the token was made (tokens from before logout existed have no v).
export type TokenPayload = { sub: string; v?: number };

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private storage: StorageService,
  ) {}

  // Email + password -> login token. Only active workers with admin access may log in.
  async login(email: string, password: string) {
    const worker = await this.prisma.worker.findUnique({
      where: { email: email.toLowerCase().trim() },
      omit: { passwordHash: false, tokenVersion: false }, // needed to check the password
    });

    // Same message for every failure, so nobody can guess which emails exist
    const wrong = new UnauthorizedException('Wrong email or password');
    if (!worker || !worker.passwordHash) throw wrong;
    const { passwordHash, tokenVersion, ...safeWorker } = worker;
    if (!(await compare(password, passwordHash))) throw wrong;

    if (!worker.isAdmin || worker.status !== 'Active') {
      throw new UnauthorizedException(
        'This account does not have admin access',
      );
    }

    const token = await this.makeToken(worker.id, tokenVersion);
    return { token, worker: safeWorker };
  }

  // Ends the login on every device: tokens with the old version stop working
  async logout(workerId: string) {
    await this.prisma.worker.update({
      where: { id: workerId },
      data: { tokenVersion: { increment: 1 } },
    });
    return { loggedOut: true };
  }

  // An admin edits their own account
  async updateAccount(workerId: string, dto: UpdateAccountDto) {
    const { email: newEmail, photo, currentPassword, ...fields } = dto;
    const current = await this.prisma.worker.findUniqueOrThrow({
      where: { id: workerId },
    });

    const email = newEmail?.toLowerCase().trim();
    if (email && email !== current.email) {
      await this.checkPassword(workerId, currentPassword);
      const taken = await this.prisma.worker.findUnique({ where: { email } });
      if (taken) {
        throw new ConflictException(
          `A worker with email ${email} already exists`,
        );
      }
    }

    const worker = await this.prisma.worker.update({
      where: { id: workerId },
      data: {
        ...fields,
        email,
        photo: photo === undefined ? undefined : photo || null,
      },
    });

    if (photo !== undefined && photo !== (current.photo ?? '')) {
      await this.storage.deleteByUrl(current.photo);
    }
    return worker;
  }

  // Other devices are logged out, so this device gets a new token
  async changePassword(workerId: string, dto: ChangePasswordDto) {
    await this.checkPassword(workerId, dto.currentPassword);

    const { tokenVersion, ...worker } = await this.prisma.worker.update({
      where: { id: workerId },
      data: {
        passwordHash: await hash(dto.newPassword, 10),
        tokenVersion: { increment: 1 },
      },
      omit: { tokenVersion: false },
    });
    return { token: await this.makeToken(workerId, tokenVersion), worker };
  }

  private makeToken(workerId: string, version: number) {
    const payload: TokenPayload = { sub: workerId, v: version };
    return this.jwt.signAsync(payload);
  }

  // A 400, not a 401: the website logs the admin out on every 401
  private async checkPassword(workerId: string, password?: string) {
    const { passwordHash } = await this.prisma.worker.findUniqueOrThrow({
      where: { id: workerId },
      omit: { passwordHash: false },
    });
    if (
      !password ||
      !passwordHash ||
      !(await compare(password, passwordHash))
    ) {
      throw new BadRequestException('Your current password is not correct');
    }
  }

  // Reads a token and returns the logged-in worker, or throws if it is not valid anymore
  async verify(token: string) {
    let payload: TokenPayload;
    try {
      payload = await this.jwt.verifyAsync<TokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Please log in again');
    }
    // Tokens made before ids became UUIDs hold a number: ask to log in again
    if (typeof payload.sub !== 'string') {
      throw new UnauthorizedException('Please log in again');
    }

    const found = await this.prisma.worker.findUnique({
      where: { id: payload.sub },
      omit: { tokenVersion: false },
    });
    // Checked on every request, so removing admin access works immediately
    if (!found || !found.isAdmin || found.status !== 'Active') {
      throw new UnauthorizedException(
        'This account does not have admin access',
      );
    }

    // Logged out, or the password changed, after this token was made
    const { tokenVersion, ...worker } = found;
    if ((payload.v ?? 0) !== tokenVersion) {
      throw new UnauthorizedException('Please log in again');
    }
    return worker;
  }
}
