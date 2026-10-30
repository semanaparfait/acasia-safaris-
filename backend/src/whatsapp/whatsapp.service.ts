import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

const GRAPH_API_URL = 'https://graph.facebook.com/v25.0';
const DEFAULT_COUNTRY_CODE = '250'; // Rwanda, for numbers saved like 0787 123 456

// The parts of a booking shown in the message
export type BookingSummary = {
  customer: string;
  country: string;
  phone: string | null;
  startDate: Date;
  endDate: Date;
  travelers: number;
  package: { title: string } | null;
  destinations: { title: string }[];
};

// "+250 788 123 401" -> "250788123401", "0787123456" -> "250787123456"
export const toWhatsappNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) return DEFAULT_COUNTRY_CODE + digits.slice(1);
  return digits;
};

// WhatsApp rejects template values with line breaks, tabs or long runs of spaces
const clean = (text: string) => text.replace(/\s+/g, ' ').trim();

// Sends WhatsApp messages with the Meta WhatsApp Cloud API (see backend/README.md).
// Without WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID nothing is sent.
@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  // Tells every active admin with a Rwandan number about a new booking.
  // Never throws: a booking must not fail because a notification did.
  async notifyNewBooking(booking: BookingSummary) {
    const token = this.config.get<string>('WHATSAPP_TOKEN');
    const phoneNumberId = this.config.get<string>('WHATSAPP_PHONE_NUMBER_ID');
    if (!token || !phoneNumberId) {
      this.logger.warn('WhatsApp is not configured: no message sent');
      return;
    }

    try {
      const admins = await this.prisma.worker.findMany({
        where: { OR: [{ isAdmin: true }, { isOwner: true }], status: 'Active' },
        select: { phone: true },
      });
      const numbers = new Set(
        admins
          .map((a) => toWhatsappNumber(a.phone))
          .filter((number) => number.startsWith(DEFAULT_COUNTRY_CODE)),
      );

      const results = await Promise.allSettled(
        [...numbers].map((to) =>
          this.sendTemplate(token, phoneNumberId, to, this.values(booking)),
        ),
      );
      for (const result of results) {
        if (result.status === 'rejected') {
          this.logger.error(`WhatsApp message failed: ${result.reason}`);
        }
      }
    } catch (error) {
      this.logger.error(`WhatsApp messages failed: ${error}`);
    }
  }

  // The values for {{1}} to {{6}} in the template, in order
  private values(b: BookingSummary) {
    const trip =
      b.package?.title ?? b.destinations.map((d) => d.title).join(', ');
    const day = (date: Date) => date.toISOString().slice(0, 10);
    return [
      b.customer,
      b.country,
      b.phone || 'Not given',
      trip,
      `${day(b.startDate)} to ${day(b.endDate)}`,
      String(b.travelers),
    ].map(clean);
  }

  private async sendTemplate(
    token: string,
    phoneNumberId: string,
    to: string,
    values: string[],
  ) {
    const response = await fetch(`${GRAPH_API_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: this.config.get<string>('WHATSAPP_TEMPLATE') ?? 'new_booking',
          language: {
            code: this.config.get<string>('WHATSAPP_TEMPLATE_LANGUAGE') ?? 'en',
          },
          components: [
            {
              type: 'body',
              parameters: values.map((text) => ({ type: 'text', text })),
            },
          ],
        },
      }),
    });
    if (!response.ok) {
      throw new Error(`${response.status} ${await response.text()}`);
    }
  }
}
