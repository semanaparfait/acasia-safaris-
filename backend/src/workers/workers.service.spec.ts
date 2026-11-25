import { PrismaService } from '../prisma/prisma.service';
import { TranslationsService } from '../translations/translations.service';
import { LiveGateway } from '../live/live.gateway';
import { RolesService } from '../roles/roles.service';
import { StorageService } from '../storage/storage.service';
import { WorkerDto } from './dto/worker.dto';
import { WorkersService } from './workers.service';

const owner = { id: 'o1', isOwner: true } as never;

const dto = {
  name: 'New Admin',
  personalEmail: 'New@Example.com',
  phone: '0798635578',
  role: 'Admin',
  languages: [],
  status: 'Active',
  joined: '2026-10-31',
  isAdmin: true,
  password: 'secret123',
} as WorkerDto;

const setup = () => {
  const saved = { id: 'w1', isOwner: false, isAdmin: true, passwordHash: 'x' };
  const worker = {
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue(saved),
    update: jest.fn().mockResolvedValue(saved),
  };
  const live = { accessChanged: jest.fn() };
  const service = new WorkersService(
    { worker } as unknown as PrismaService,
    {} as StorageService,
    { checkExists: jest.fn() } as unknown as RolesService,
    live as unknown as LiveGateway,
    { refreshLater: jest.fn() } as unknown as TranslationsService,
  );
  return { service, worker, live };
};

const joinedOf = (mock: jest.Mock) => {
  const [call] = mock.mock.calls[0] as [{ data: { joined: unknown } }];
  return call.data.joined;
};

describe('WorkersService', () => {
  it('saves the joined date of a new worker as a real date', async () => {
    const { service, worker } = setup();
    await service.create(dto, owner);

    expect(joinedOf(worker.create)).toEqual(new Date('2026-10-31'));
  });

  it('saves a changed joined date as a real date', async () => {
    const { service, worker } = setup();
    worker.findUnique.mockResolvedValueOnce({
      id: 'w1',
      email: 'new@acaciasafarisrwanda.com',
      isOwner: false,
      isAdmin: true,
      passwordHash: 'x',
    });
    await service.update('w1', { ...dto, password: undefined }, owner);

    expect(joinedOf(worker.update)).toEqual(new Date('2026-10-31'));
  });

  it('lets the database set the date when none is sent', async () => {
    const { service, worker } = setup();
    await service.create({ ...dto, joined: undefined }, owner);

    expect(joinedOf(worker.create)).toBeUndefined();
  });

  it('makes the company email from the first name', async () => {
    const { service, worker } = setup();
    await service.create({ ...dto, name: 'Éric  Niyonzima' }, owner);

    const [{ data }] = worker.create.mock.calls[0] as [
      { data: { email: string; personalEmail: string } },
    ];
    expect(data.email).toBe('eric@acaciasafarisrwanda.com');
    expect(data.personalEmail).toBe('new@example.com');
  });

  it('adds a number when the first name is taken', async () => {
    const { service, worker } = setup();
    worker.findUnique.mockResolvedValueOnce({ id: 'other' });
    await service.create({ ...dto, name: 'Eric Two' }, owner);

    const [{ data }] = worker.create.mock.calls[0] as [
      { data: { email: string } },
    ];
    expect(data.email).toBe('eric2@acaciasafarisrwanda.com');
  });

  it('keeps the company email when the first name stays the same', async () => {
    const { service, worker } = setup();
    worker.findUnique.mockResolvedValueOnce({
      id: 'w1',
      email: 'new2@acaciasafarisrwanda.com',
      isOwner: false,
      isAdmin: true,
      passwordHash: 'x',
    });
    await service.update('w1', { ...dto, password: undefined }, owner);

    const [{ data }] = worker.update.mock.calls[0] as [
      { data: { email: string } },
    ];
    expect(data.email).toBe('new2@acaciasafarisrwanda.com');
  });

  it('needs a company role to show a worker on the website', async () => {
    const { service } = setup();
    await expect(
      service.create({ ...dto, showOnWebsite: true, companyRole: ' ' }, owner),
    ).rejects.toThrow('Add a company role');
  });

  it('keeps only the social links that are filled in', async () => {
    const { service, worker } = setup();
    await service.create(
      {
        ...dto,
        showOnWebsite: true,
        companyRole: 'CEO & Founder',
        bio: '  ',
        socials: { instagram: 'https://instagram.com/acacia', x: '' },
      },
      owner,
    );

    const [{ data }] = worker.create.mock.calls[0] as [
      { data: { socials: object; bio: unknown; companyRole: string } },
    ];
    expect(data.socials).toEqual({ instagram: 'https://instagram.com/acacia' });
    expect(data.bio).toBeNull();
    expect(data.companyRole).toBe('CEO & Founder');
  });

  describe('admin access (permissions)', () => {
    const current = (permissions: string[]) => ({
      id: 'w1',
      email: 'new@acaciasafarisrwanda.com',
      isOwner: false,
      isAdmin: true,
      passwordHash: 'x',
      permissions,
    });
    const dataOf = (mock: jest.Mock) =>
      (mock.mock.calls[0] as [{ data: { permissions: unknown } }])[0].data;
    const otherAdmin = { id: 'a2', isOwner: false } as never;

    it('lets the main admin give access, and tells the open panel at once', async () => {
      const { service, worker, live } = setup();
      worker.findUnique.mockResolvedValueOnce(current(['bookings']));
      await service.update(
        'w1',
        {
          ...dto,
          password: undefined,
          permissions: ['trips', 'bookings', 'x'],
        },
        owner,
      );
      // kept in the usual order, unknown names dropped
      expect(dataOf(worker.update).permissions).toEqual(['bookings', 'trips']);
      expect(live.accessChanged).toHaveBeenCalledWith('w1');
    });

    it('refuses an access change from another admin', async () => {
      const { service, worker } = setup();
      worker.findUnique.mockResolvedValueOnce(current(['bookings']));
      await expect(
        service.update(
          'w1',
          { ...dto, password: undefined, permissions: ['workers'] },
          otherAdmin,
        ),
      ).rejects.toThrow('Only the main admin');
      expect(worker.update).not.toHaveBeenCalled();
    });

    it('keeps the access when another admin saves other fields', async () => {
      const { service, worker } = setup();
      worker.findUnique.mockResolvedValueOnce(current(['bookings']));
      await service.update(
        'w1',
        { ...dto, password: undefined, permissions: ['bookings'] },
        otherAdmin,
      );
      expect(dataOf(worker.update).permissions).toEqual(['bookings']);
    });

    it('removes every access with admin access', async () => {
      const { service, worker } = setup();
      worker.findUnique.mockResolvedValueOnce(current(['bookings']));
      await service.update(
        'w1',
        { ...dto, isAdmin: false, password: undefined },
        owner,
      );
      expect(dataOf(worker.update).permissions).toEqual([]);
    });
  });
});
