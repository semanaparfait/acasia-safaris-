import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import {
  BookingSummary,
  toWhatsappNumber,
  WhatsappService,
} from './whatsapp.service';

const booking: BookingSummary = {
  customer: 'Jane\nDoe',
  country: 'Kenya',
  phone: null,
  startDate: new Date('2026-12-01'),
  endDate: new Date('2026-12-05'),
  travelers: 2,
  package: null,
  destinations: [{ title: 'Lakes' }, { title: 'Rainforest' }],
};

const setup = (env: Record<string, string>, phones: string[]) => {
  const config = { get: (key: string) => env[key] } as unknown as ConfigService;
  const prisma = {
    worker: {
      findMany: jest.fn().mockResolvedValue(phones.map((phone) => ({ phone }))),
    },
  } as unknown as PrismaService;
  return new WhatsappService(config, prisma);
};

const configured = { WHATSAPP_TOKEN: 't', WHATSAPP_PHONE_NUMBER_ID: '123' };

describe('WhatsappService', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue({ ok: true });
    global.fetch = fetchMock;
  });

  it('turns saved phone numbers into WhatsApp numbers', () => {
    expect(toWhatsappNumber('+250 788 123 401')).toBe('250788123401');
    expect(toWhatsappNumber('0787845162')).toBe('250787845162');
    expect(toWhatsappNumber('00254712330407')).toBe('254712330407');
  });

  it('sends nothing when it is not configured', async () => {
    await setup({}, ['0787845162']).notifyNewBooking(booking);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('messages each Rwandan admin number once with the booking details', async () => {
    await setup(configured, [
      '0787845162',
      '+250 787 845 162',
      '+250 788 123 401',
      '+254 712 330 407',
    ]).notifyNewBooking(booking);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [, init] = fetchMock.mock.calls[0] as [string, { body: string }];
    const body = JSON.parse(init.body) as {
      to: string;
      template: {
        components: { parameters: { text: string }[] }[];
      };
    };
    expect(body.to).toBe('250787845162');
    expect(body.template.components[0].parameters.map((p) => p.text)).toEqual([
      'Jane Doe',
      'Kenya',
      'Not given',
      'Lakes, Rainforest',
      '2026-12-01 to 2026-12-05',
      '2',
    ]);
  });

  it('does not throw when WhatsApp rejects a message', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve('bad template'),
    });
    await expect(
      setup(configured, ['0787845162']).notifyNewBooking(booking),
    ).resolves.toBeUndefined();
  });
});
