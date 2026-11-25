import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth/auth.service';
import { AdminGuard } from './admin.guard';
import { Access, OwnerOnly, adminsWithAccess, accessOf } from './permissions';

// A controller with an area, a route that also lets check-in in, and an owner-only route
@Access('bookings')
class BookingsLike {
  list() {}
  @Access('checkin', 'bookings')
  ticket() {}
  @OwnerOnly()
  backup() {}
}

const run = (
  worker: { isOwner: boolean; permissions: string[] },
  handler: keyof BookingsLike,
) => {
  const auth = {
    verify: jest.fn().mockResolvedValue({ id: 'w1', ...worker }),
  } as unknown as AuthService;
  const guard = new AdminGuard(auth, new Reflector());
  const request = {
    method: 'GET',
    headers: { authorization: 'Bearer t' },
  };
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () =>
      Object.getOwnPropertyDescriptor(BookingsLike.prototype, handler)!
        .value as unknown,
    getClass: () => BookingsLike,
  } as unknown as ExecutionContext;
  return guard.canActivate(context);
};

describe('AdminGuard access', () => {
  it('lets in an admin with the area', async () => {
    await expect(
      run({ isOwner: false, permissions: ['bookings'] }, 'list'),
    ).resolves.toBe(true);
  });

  it('refuses an admin without it, saying what is missing', async () => {
    await expect(
      run({ isOwner: false, permissions: ['gallery'] }, 'list'),
    ).rejects.toThrow('You do not have access to Bookings & customers');
  });

  it('uses the route access over the controller access', async () => {
    await expect(
      run({ isOwner: false, permissions: ['checkin'] }, 'ticket'),
    ).resolves.toBe(true);
    await expect(
      run({ isOwner: false, permissions: ['checkin'] }, 'list'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('lets the main admin in everywhere', async () => {
    await expect(run({ isOwner: true, permissions: [] }, 'list')).resolves.toBe(
      true,
    );
    await expect(
      run({ isOwner: true, permissions: [] }, 'backup'),
    ).resolves.toBe(true);
  });

  it('keeps owner-only routes for the main admin, whatever the access', async () => {
    await expect(
      run({ isOwner: false, permissions: ['bookings'] }, 'backup'),
    ).rejects.toThrow('Only the main admin');
  });
});

describe('permissions helpers', () => {
  it('gives the main admin every area', () => {
    expect(accessOf({ isOwner: true, permissions: [] })).toHaveLength(12);
    expect(accessOf({ isOwner: false, permissions: ['trips', 'x'] })).toEqual([
      'trips',
    ]);
  });

  it('only alerts active admins with the area (and the main admin)', () => {
    expect(adminsWithAccess('trips')).toEqual({
      status: 'Active',
      OR: [{ isOwner: true }, { isAdmin: true, permissions: { has: 'trips' } }],
    });
  });
});
