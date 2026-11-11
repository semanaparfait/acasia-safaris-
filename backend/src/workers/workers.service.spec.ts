import { PrismaService } from '../prisma/prisma.service';
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
  const service = new WorkersService(
    { worker } as unknown as PrismaService,
    {} as StorageService,
    { checkExists: jest.fn() } as unknown as RolesService,
  );
  return { service, worker };
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
      email: 'new@acaciasafaris.com',
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
    expect(data.email).toBe('eric@acaciasafaris.com');
    expect(data.personalEmail).toBe('new@example.com');
  });

  it('adds a number when the first name is taken', async () => {
    const { service, worker } = setup();
    worker.findUnique.mockResolvedValueOnce({ id: 'other' });
    await service.create({ ...dto, name: 'Eric Two' }, owner);

    const [{ data }] = worker.create.mock.calls[0] as [
      { data: { email: string } },
    ];
    expect(data.email).toBe('eric2@acaciasafaris.com');
  });

  it('keeps the company email when the first name stays the same', async () => {
    const { service, worker } = setup();
    worker.findUnique.mockResolvedValueOnce({
      id: 'w1',
      email: 'new2@acaciasafaris.com',
      isOwner: false,
      isAdmin: true,
      passwordHash: 'x',
    });
    await service.update('w1', { ...dto, password: undefined }, owner);

    const [{ data }] = worker.update.mock.calls[0] as [
      { data: { email: string } },
    ];
    expect(data.email).toBe('new2@acaciasafaris.com');
  });
});
