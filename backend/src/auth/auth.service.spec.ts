import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AuthService } from './auth.service';

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
  const service = new AuthService(
    { worker } as unknown as PrismaService,
    jwt as unknown as JwtService,
    storage as unknown as StorageService,
  );
  return { service, worker, jwt, storage };
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

  it('needs the current password to change the email', async () => {
    const { service, worker } = setup();
    worker.findUniqueOrThrow
      .mockResolvedValueOnce(row())
      .mockResolvedValueOnce({ passwordHash: await hash('secret123', 4) });

    await expect(
      service.updateAccount('w1', { email: 'new@b.co' }),
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
      data: { name: 'New Name', email: undefined, photo: undefined },
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
    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 'w1', v: 4 });
    expect(result.token).toBe('new-token');
    expect(result.worker).not.toHaveProperty('tokenVersion');
  });
});
