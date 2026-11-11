import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcryptjs';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AuthService, maskEmail } from './auth.service';

const row = (changes = {}) => ({
  id: 'w1',
  email: 'a@b.co',
  photo: null as string | null,
  isAdmin: true,
  status: 'Active',
  tokenVersion: 3,
  ...changes,
});

const setup = () => {
  const worker = {
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    update: jest.fn(),
  };
  const jwt = {
    verifyAsync: jest.fn(),
    signAsync: jest.fn().mockResolvedValue('new-token'),
  };
  const storage = { deleteByUrl: jest.fn() };
  const mail = { sendResetCode: jest.fn(), sendLoginCode: jest.fn() };
  const service = new AuthService(
    { worker } as unknown as PrismaService,
    jwt as unknown as JwtService,
    storage as unknown as StorageService,
    mail as unknown as MailService,
    { record: jest.fn() } as unknown as AuditService,
  );
  return { service, worker, jwt, storage, mail };
};

describe('AuthService', () => {
  it('accepts a token with the current version', async () => {
    const { service, worker, jwt } = setup();
    jwt.verifyAsync.mockResolvedValue({ sub: 'w1', v: 3 });
    worker.findUnique.mockResolvedValue(row());

    const result = await service.verify('token');
    expect(result.id).toBe('w1');
    expect(result).not.toHaveProperty('tokenVersion');
  });

  it('rejects a token from before a logout', async () => {
    const { service, worker, jwt } = setup();
    jwt.verifyAsync.mockResolvedValue({ sub: 'w1', v: 2 });
    worker.findUnique.mockResolvedValue(row());

    await expect(service.verify('token')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('keeps tokens made before logout existed until the first logout', async () => {
    const { service, worker, jwt } = setup();
    jwt.verifyAsync.mockResolvedValue({ sub: 'w1' });
    worker.findUnique.mockResolvedValue(row({ tokenVersion: 0 }));

    await expect(service.verify('token')).resolves.toBeDefined();
  });

  it('raises the token version on logout', async () => {
    const { service, worker } = setup();
    await service.logout('w1');
    expect(worker.update).toHaveBeenCalledWith({
      where: { id: 'w1' },
      data: { tokenVersion: { increment: 1 } },
    });
  });

  it('needs the current password to change the personal email', async () => {
    const { service, worker } = setup();
    worker.findUniqueOrThrow
      .mockResolvedValueOnce(row())
      .mockResolvedValueOnce({ passwordHash: await hash('secret123', 4) });

    await expect(
      service.updateAccount('w1', { personalEmail: 'new@b.co' }),
    ).rejects.toThrow(BadRequestException);
    expect(worker.update).not.toHaveBeenCalled();
  });

  it('edits the name without a password and leaves the photo alone', async () => {
    const { service, worker, storage } = setup();
    worker.findUniqueOrThrow.mockResolvedValue(row({ photo: 'old.png' }));
    worker.update.mockResolvedValue(row());

    await service.updateAccount('w1', { name: 'New Name' });
    expect(worker.update).toHaveBeenCalledWith({
      where: { id: 'w1' },
      data: { name: 'New Name', personalEmail: undefined, photo: undefined },
    });
    expect(storage.deleteByUrl).not.toHaveBeenCalled();
  });

  it('deletes the old photo when it is replaced', async () => {
    const { service, worker, storage } = setup();
    worker.findUniqueOrThrow.mockResolvedValue(row({ photo: 'old.png' }));
    worker.update.mockResolvedValue(row());

    await service.updateAccount('w1', { photo: 'new.png' });
    expect(storage.deleteByUrl).toHaveBeenCalledWith('old.png');
  });

  it('refuses a wrong password and keeps the old one', async () => {
    const { service, worker } = setup();
    worker.findUniqueOrThrow.mockResolvedValue({
      passwordHash: await hash('secret123', 4),
    });

    await expect(
      service.changePassword('w1', {
        currentPassword: 'wrong',
        newPassword: 'another123',
      }),
    ).rejects.toThrow(BadRequestException);
    expect(worker.update).not.toHaveBeenCalled();
  });

  it('gives this device a new token after a password change', async () => {
    const { service, worker, jwt } = setup();
    worker.findUniqueOrThrow.mockResolvedValue({
      passwordHash: await hash('secret123', 4),
    });
    worker.update.mockResolvedValue(row({ tokenVersion: 4 }));

    const result = await service.changePassword('w1', {
      currentPassword: 'secret123',
      newPassword: 'another123',
    });
    expect(jwt.signAsync).toHaveBeenCalledWith(
      { sub: 'w1', v: 4, purpose: 'session' },
      undefined,
    );
    expect(result.token).toBe('new-token');
    expect(result.worker).not.toHaveProperty('tokenVersion');
  });

  describe('forgot password', () => {
    const admin = (changes = {}) =>
      row({ name: 'Jean', personalEmail: 'jean@gmail.com', ...changes });

    it('emails a 6 digit code to the personal email', async () => {
      const { service, worker, mail } = setup();
      worker.findUnique.mockResolvedValue(admin({ resetCodeExpires: null }));

      await service.forgotPassword('Jean@AcaciaSafaris.com');
      expect(worker.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: 'jean@acaciasafaris.com' },
        }),
      );
      const [{ to, code }] = mail.sendResetCode.mock.calls[0] as [
        { to: string; code: string },
      ];
      expect(to).toBe('jean@gmail.com');
      expect(code).toMatch(/^\d{6}$/);
    });

    it('says when no account uses the company email', async () => {
      const { service, worker, mail } = setup();
      worker.findUnique.mockResolvedValue(null);

      await expect(
        service.forgotPassword('nobody@acaciasafaris.com'),
      ).rejects.toThrow('No account uses this company email');
      expect(mail.sendResetCode).not.toHaveBeenCalled();
    });

    it('returns the personal email partly hidden', async () => {
      const { service, worker } = setup();
      worker.findUnique.mockResolvedValue(
        admin({
          personalEmail: 'shemaparfait@gmail.com',
          resetCodeExpires: null,
        }),
      );

      const result = await service.forgotPassword('semana@acaciasafaris.com');
      expect(result.sentTo).toBe('sh********it@gmail.com');
    });

    it('hides short email names too', () => {
      expect(maskEmail('abc@gmail.com')).toBe('a**@gmail.com');
      expect(maskEmail('a@gmail.com')).toBe('a*@gmail.com');
    });

    it('does not send a second email within a minute', async () => {
      const { service, worker, mail } = setup();
      worker.findUnique.mockResolvedValue(
        admin({ resetCodeExpires: new Date(Date.now() + 15 * 60_000 - 5000) }),
      );

      await service.forgotPassword('jean@acaciasafaris.com');
      expect(mail.sendResetCode).not.toHaveBeenCalled();
    });

    it('counts a wrong code', async () => {
      const { service, worker } = setup();
      worker.findUnique.mockResolvedValue(
        admin({
          resetCodeHash: await hash('123456', 4),
          resetCodeExpires: new Date(Date.now() + 60_000),
          resetAttempts: 0,
        }),
      );
      worker.update.mockResolvedValue({ resetAttempts: 1 });

      await expect(
        service.verifyResetCode('jean@acaciasafaris.com', '000000'),
      ).rejects.toThrow('Wrong code. 4 tries left.');
    });

    it('refuses an expired code', async () => {
      const { service, worker } = setup();
      worker.findUnique.mockResolvedValue(
        admin({
          resetCodeHash: await hash('123456', 4),
          resetCodeExpires: new Date(Date.now() - 1000),
          resetAttempts: 0,
        }),
      );

      await expect(
        service.verifyResetCode('jean@acaciasafaris.com', '123456'),
      ).rejects.toThrow(BadRequestException);
    });

    it('sets the new password, uses up the code and logs in', async () => {
      const { service, worker, jwt } = setup();
      worker.findUnique.mockResolvedValue(
        admin({
          resetCodeHash: await hash('123456', 4),
          resetCodeExpires: new Date(Date.now() + 60_000),
          resetAttempts: 2,
        }),
      );
      worker.update.mockResolvedValue(row({ tokenVersion: 4 }));

      const result = await service.resetPassword(
        'jean@acaciasafaris.com',
        '123456',
        'brandnew123',
      );
      const [{ data }] = worker.update.mock.calls[0] as [
        { data: Record<string, unknown> },
      ];
      expect(data.resetCodeHash).toBeNull();
      expect(data.tokenVersion).toEqual({ increment: 1 });
      expect(jwt.signAsync).toHaveBeenCalledWith(
        { sub: 'w1', v: 4, purpose: 'session' },
        undefined,
      );
      expect(result.token).toBe('new-token');
    });
  });

  describe('two-step login', () => {
    const admin = async (changes = {}) =>
      row({
        name: 'Jean',
        personalEmail: 'jean@gmail.com',
        passwordHash: await hash('secret123', 4),
        loginCodeExpires: null,
        ...changes,
      });

    it('asks for a code after the right password, and emails it', async () => {
      const { service, worker, mail, jwt } = setup();
      worker.findUnique.mockResolvedValue(await admin());
      worker.findUniqueOrThrow.mockResolvedValue(await admin());

      const result = await service.login('jean@acaciasafaris.com', 'secret123');
      expect(result).toMatchObject({ twoStep: true, sentTo: 'j***@gmail.com' });
      expect(result).not.toHaveProperty('token');
      expect(mail.sendLoginCode).toHaveBeenCalled();
      expect(jwt.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ purpose: 'login' }),
        { expiresIn: '10m' },
      );
    });

    it('skips the code on a trusted device of the same worker', async () => {
      const { service, worker, mail, jwt } = setup();
      worker.findUnique.mockResolvedValue(await admin());
      jwt.verifyAsync.mockResolvedValue({ sub: 'w1', v: 3, purpose: 'device' });

      const result = await service.login(
        'jean@acaciasafaris.com',
        'secret123',
        {
          deviceToken: 'device-token',
        },
      );
      expect(result).toHaveProperty('token', 'new-token');
      expect(mail.sendLoginCode).not.toHaveBeenCalled();
    });

    it('does not trust a device from before a password change', async () => {
      const { service, worker, mail, jwt } = setup();
      worker.findUnique.mockResolvedValue(await admin());
      worker.findUniqueOrThrow.mockResolvedValue(await admin());
      jwt.verifyAsync.mockResolvedValue({ sub: 'w1', v: 2, purpose: 'device' });

      const result = await service.login(
        'jean@acaciasafaris.com',
        'secret123',
        {
          deviceToken: 'old-device-token',
        },
      );
      expect(result).toHaveProperty('twoStep', true);
      expect(mail.sendLoginCode).toHaveBeenCalled();
    });

    it('logs in with the right code and can trust the device', async () => {
      const { service, worker, jwt } = setup();
      jwt.verifyAsync.mockResolvedValue({ sub: 'w1', v: 3, purpose: 'login' });
      // As the database returns it: the password hash is never selected (PrismaService omit)
      const { passwordHash, ...stored } = (await admin({
        loginCodeHash: await hash('123456', 4),
        loginCodeExpires: new Date(Date.now() + 60_000),
        loginAttempts: 0,
      })) as Record<string, unknown>;
      void passwordHash;
      worker.findUnique.mockResolvedValue(stored);

      const result = await service.verifyLogin('challenge', '123456', true);
      expect(result.token).toBe('new-token');
      expect(result.deviceToken).toBe('new-token');
      expect(result.worker).not.toHaveProperty('loginCodeHash');
      expect(result.worker).not.toHaveProperty('passwordHash');
    });

    it('refuses a wrong code and counts it', async () => {
      const { service, worker, jwt } = setup();
      jwt.verifyAsync.mockResolvedValue({ sub: 'w1', v: 3, purpose: 'login' });
      worker.findUnique.mockResolvedValue(
        await admin({
          loginCodeHash: await hash('123456', 4),
          loginCodeExpires: new Date(Date.now() + 60_000),
          loginAttempts: 0,
        }),
      );
      worker.update.mockResolvedValue({ loginAttempts: 1 });

      await expect(
        service.verifyLogin('challenge', '000000', false),
      ).rejects.toThrow('Wrong code. 4 tries left.');
    });

    it('a login-code token is not a login', async () => {
      const { service, jwt } = setup();
      jwt.verifyAsync.mockResolvedValue({ sub: 'w1', v: 3, purpose: 'login' });
      await expect(service.verify('challenge')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
