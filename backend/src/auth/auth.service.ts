import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { randomInt } from 'crypto';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ChangePasswordDto, UpdateAccountDto } from './dto/account.dto';

// What is stored inside the login token. sub = worker id (UUID), v = the worker's
// tokenVersion when the token was made (tokens from before logout existed have no v).
export type TokenPayload = { sub: string; v?: number };

// "shemaparfait@gmail.com" -> "sh********it@gmail.com" (short names keep only the first letter)
export function maskEmail(email: string) {
  const at = email.lastIndexOf('@');
  const name = email.slice(0, at);
  const domain = email.slice(at);
  if (name.length <= 4) {
    return name[0] + '*'.repeat(Math.max(name.length - 1, 1)) + domain;
  }
  return (
    name.slice(0, 2) + '*'.repeat(name.length - 4) + name.slice(-2) + domain
  );
}

// Forgot password codes
const CODE_MINUTES = 15; // how long a code works
const MAX_CODE_TRIES = 5; // wrong codes before it stops working
const RESEND_SECONDS = 60; // a new code can be asked for after this

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private storage: StorageService,
    private mail: MailService,
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
    const { personalEmail: newEmail, photo, currentPassword, ...fields } = dto;
    const current = await this.prisma.worker.findUniqueOrThrow({
      where: { id: workerId },
    });

    // The personal email can reset the password, so changing it needs the password
    const personalEmail = newEmail?.toLowerCase().trim();
    if (personalEmail && personalEmail !== current.personalEmail) {
      await this.checkPassword(workerId, currentPassword);
    }

    const worker = await this.prisma.worker.update({
      where: { id: workerId },
      data: {
        ...fields,
        personalEmail,
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

  // Forgot password, step 1: emails a 6 digit code to the personal email
  // and returns that email partly hidden. 404 if no worker has this company email.
  async forgotPassword(email: string) {
    const worker = await this.prisma.worker.findUnique({
      where: { email: email.toLowerCase().trim() },
      omit: { resetCodeExpires: false },
    });
    if (!worker) {
      throw new NotFoundException('No account uses this company email');
    }
    if (!worker.isAdmin || worker.status !== 'Active') {
      throw new BadRequestException(
        'This account cannot sign in to the admin panel',
      );
    }
    if (!worker.personalEmail) {
      throw new BadRequestException(
        'This account has no personal email yet. Ask the main admin to add one under Workers.',
      );
    }
    // Where the code went, partly hidden: "shemaparfait@gmail.com" -> "sh********it@gmail.com"
    const answer = { sentTo: maskEmail(worker.personalEmail) };

    // Do not send a new email more than once a minute (the last code still works)
    const sentAt = worker.resetCodeExpires
      ? worker.resetCodeExpires.getTime() - CODE_MINUTES * 60_000
      : 0;
    if (Date.now() - sentAt < RESEND_SECONDS * 1000) {
      this.logger.warn(
        `Reset code for ${email} not sent again: one was sent less than a minute ago`,
      );
      return answer;
    }

    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    await this.prisma.worker.update({
      where: { id: worker.id },
      data: {
        resetCodeHash: await hash(code, 10),
        resetCodeExpires: new Date(Date.now() + CODE_MINUTES * 60_000),
        resetAttempts: 0,
      },
    });

    try {
      await this.mail.sendResetCode({
        to: worker.personalEmail,
        name: worker.name,
        code,
        minutes: CODE_MINUTES,
      });
    } catch (error) {
      // Not sent: forget the code so the worker can ask again right away
      await this.clearResetCode(worker.id);
      throw error;
    }
    this.logger.log(`Reset code for ${email} sent to ${worker.personalEmail}`);
    return answer;
  }

  // Step 2: checks the code without using it up
  async verifyResetCode(email: string, code: string) {
    await this.checkResetCode(email, code);
    return { valid: true };
  }

  // Step 3: sets the new password. The code is used up, every device is logged out,
  // and this device is logged in with the new password.
  async resetPassword(email: string, code: string, newPassword: string) {
    const workerId = await this.checkResetCode(email, code);
    const { tokenVersion, ...worker } = await this.prisma.worker.update({
      where: { id: workerId },
      data: {
        passwordHash: await hash(newPassword, 10),
        tokenVersion: { increment: 1 },
        resetCodeHash: null,
        resetCodeExpires: null,
        resetAttempts: 0,
      },
      omit: { tokenVersion: false },
    });
    return { token: await this.makeToken(workerId, tokenVersion), worker };
  }

  // Returns the worker's id when the code is right, or throws a 400
  private async checkResetCode(email: string, code: string) {
    const worker = await this.prisma.worker.findUnique({
      where: { email: email.toLowerCase().trim() },
      omit: {
        resetCodeHash: false,
        resetCodeExpires: false,
        resetAttempts: false,
      },
    });
    const expired = new BadRequestException(
      'This code is not valid anymore. Please ask for a new one.',
    );
    if (
      !worker?.resetCodeHash ||
      !worker.resetCodeExpires ||
      worker.resetCodeExpires.getTime() < Date.now() ||
      worker.resetAttempts >= MAX_CODE_TRIES ||
      !worker.isAdmin ||
      worker.status !== 'Active'
    ) {
      throw expired;
    }

    if (!(await compare(code, worker.resetCodeHash))) {
      const { resetAttempts } = await this.prisma.worker.update({
        where: { id: worker.id },
        data: { resetAttempts: { increment: 1 } },
        omit: { resetAttempts: false },
      });
      const left = MAX_CODE_TRIES - resetAttempts;
      if (left <= 0) throw expired;
      throw new BadRequestException(
        `Wrong code. ${left} ${left === 1 ? 'try' : 'tries'} left.`,
      );
    }
    return worker.id;
  }

  private async clearResetCode(workerId: string) {
    await this.prisma.worker.update({
      where: { id: workerId },
      data: { resetCodeHash: null, resetCodeExpires: null, resetAttempts: 0 },
    });
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
