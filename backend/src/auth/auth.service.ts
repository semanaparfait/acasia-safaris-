import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

// What is stored inside the login token
export type TokenPayload = { sub: number }; // sub = worker id

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // Email + password -> login token. Only active workers with admin access may log in.
  async login(email: string, password: string) {
    const worker = await this.prisma.worker.findUnique({
      where: { email: email.toLowerCase().trim() },
      omit: { passwordHash: false }, // we need the hash to check the password
    });

    // Same message for every failure, so nobody can guess which emails exist
    const wrong = new UnauthorizedException('Wrong email or password');
    if (!worker || !worker.passwordHash) throw wrong;
    if (!(await compare(password, worker.passwordHash))) throw wrong;

    if (!worker.isAdmin || worker.status !== 'Active') {
      throw new UnauthorizedException(
        'This account does not have admin access',
      );
    }

    const payload: TokenPayload = { sub: worker.id };
    const token = await this.jwt.signAsync(payload);

    const { passwordHash: _hash, ...safeWorker } = worker;
    return { token, worker: safeWorker };
  }

  // Reads a token and returns the logged-in worker, or throws if it is not valid anymore
  async verify(token: string) {
    let payload: TokenPayload;
    try {
      payload = await this.jwt.verifyAsync<TokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Please log in again');
    }

    const worker = await this.prisma.worker.findUnique({
      where: { id: payload.sub },
    });
    // Checked on every request, so removing admin access works immediately
    if (!worker || !worker.isAdmin || worker.status !== 'Active') {
      throw new UnauthorizedException(
        'This account does not have admin access',
      );
    }
    return worker;
  }
}
