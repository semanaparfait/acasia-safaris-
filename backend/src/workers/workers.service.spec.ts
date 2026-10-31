import { PrismaService } from '../prisma/prisma.service';
import { RolesService } from '../roles/roles.service';
import { StorageService } from '../storage/storage.service';
import { WorkerDto } from './dto/worker.dto';
import { WorkersService } from './workers.service';

const owner = { id: 'o1', isOwner: true } as never;

const dto = {
  name: 'New Admin',
  email: 'New@Example.com',
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
});
