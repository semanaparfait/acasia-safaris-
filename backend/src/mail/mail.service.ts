import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';
import { safeFileName } from '../common/file-name';

const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ] ?? c,
  );

export type QuotationEmail = {
  to: string;
  name: string;
  packageTitle: string;
  pdfUrl: string;
};

// Sends emails over SMTP (see "Quotation emails" in backend/README.md).
// Without SMTP_HOST, SMTP_USER and SMTP_PASS no email can be sent.
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transport: Transporter | null = null;
  private from = '';

  constructor(config: ConfigService) {
    const host = config.get<string>('SMTP_HOST');
    const user = config.get<string>('SMTP_USER');
    const pass = config.get<string>('SMTP_PASS');
    if (!host || !user || !pass) return;

    const port = Number(config.get<string>('SMTP_PORT') ?? 465);
    this.transport = createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    this.from = config.get<string>('MAIL_FROM') ?? user;
  }

  // Throws ServiceUnavailableException if the email could not be sent
  async sendQuotation({ to, name, packageTitle, pdfUrl }: QuotationEmail) {
    const failed = new ServiceUnavailableException(
      'We could not email your quotation right now, but our team has your request. You can also download it.',
    );
    if (!this.transport) {
      this.logger.warn('Email is not configured: quotation not sent');
      throw failed;
    }

    try {
      await this.transport.sendMail({
        from: this.from,
        to,
        subject: `Your quotation: ${packageTitle}`,
        text: `Hello ${name},\n\nThank you for your interest in ${packageTitle}. Your quotation is attached to this email, and you can also download it here:\n${pdfUrl}\n\nReply to this email or message us on WhatsApp if you have any questions.\n\nAcacia Safaris`,
        html: quotationHtml(name, packageTitle, pdfUrl),
        attachments: [
          {
            filename: `${safeFileName(packageTitle)} - Quotation.pdf`,
            path: pdfUrl,
            contentType: 'application/pdf',
          },
        ],
      });
    } catch (error) {
      this.logger.error(`Quotation email failed: ${error}`);
      throw failed;
    }
  }

  // The booking is confirmed: everything about the trip, and the QR code ticket to bring.
  // The QR code is attached inline (cid), because Gmail does not show data: images.
  // Never throws: a failed email is only logged.
  async sendBookingConfirmation(email: ConfirmationEmail) {
    if (!this.transport) {
      this.logger.warn('Email is not configured: confirmation not sent');
      return;
    }
    const transport = this.transport;
    const ticket = {
      filename: `Ticket ${email.ticketCode}.png`,
      content: email.qrPng,
      cid: 'ticket-qr',
    };
    const quotation = email.quotationUrl && {
      filename: `${safeFileName(email.title)} - Quotation.pdf`,
      path: email.quotationUrl,
      contentType: 'application/pdf',
    };
    const send = (withPdf: boolean) =>
      transport.sendMail({
        from: this.from,
        to: email.to,
        subject: `Confirmed: ${email.title} · ${email.dates}`,
        text: [
          `Hello ${email.name},`,
          `Your booking for ${email.title} is confirmed.`,
          `Dates: ${email.dates}`,
          `Travelers: ${email.travelers}`,
          `Price: ${email.price}`,
          `Your ticket code is ${email.ticketCode}. Bring the QR code (printed or on your phone) on the day of your trip.`,
          `Open your booking: ${email.link}`,
          'Acacia Safaris',
        ].join('\n\n'),
        html: confirmationHtml(
          withPdf ? email : { ...email, quotationUrl: null },
        ),
        attachments: withPdf && quotation ? [ticket, quotation] : [ticket],
      });

    try {
      await send(true);
    } catch (error) {
      // The PDF could not be downloaded? The ticket matters most: send without it
      if (!quotation) {
        this.logger.error(`Confirmation email failed: ${error}`);
        return;
      }
      this.logger.warn(
        `Confirmation with the PDF failed (${error}), sending without it`,
      );
      await send(false).catch((retryError) =>
        this.logger.error(`Confirmation email failed: ${retryError}`),
      );
    }
  }

  // Booking news for the visitor (booking received, new message, new price...),
  // with a button to their booking page. Never throws: a failed email is only logged.
  async sendBookingUpdate(email: BookingEmail) {
    if (!this.transport) {
      this.logger.warn('Email is not configured: booking update not sent');
      return;
    }
    try {
      await this.transport.sendMail({
        from: this.from,
        to: email.to,
        subject: email.subject,
        text: [
          `Hello ${email.name},`,
          ...email.paragraphs,
          `Open your booking: ${email.link}`,
          'Acacia Safaris',
        ].join('\n\n'),
        html: bookingHtml(email),
      });
    } catch (error) {
      this.logger.error(`Booking email failed: ${error}`);
    }
  }

  // Forgot password: sends the 6 digit code to the worker's personal email.
  // Throws ServiceUnavailableException if the email could not be sent.
  async sendResetCode(email: ResetCodeEmail) {
    const failed = new ServiceUnavailableException(
      'We could not send the code by email right now. Please try again later.',
    );
    if (!this.transport) {
      this.logger.warn('Email is not configured: reset code not sent');
      throw failed;
    }

    try {
      await this.transport.sendMail({
        from: this.from,
        to: email.to,
        subject: `Your Acacia Safaris password reset code: ${email.code}`,
        text: `Hello ${email.name},

Your password reset code is ${email.code}. It works for ${email.minutes} minutes.

If you did not ask for it, you can ignore this email: your password stays the same.

Acacia Safaris`,
        html: resetCodeHtml(email),
      });
    } catch (error) {
      this.logger.error(`Reset code email failed: ${error}`);
      throw failed;
    }
  }
}

export type BookingEmail = {
  to: string;
  name: string;
  subject: string;
  heading: string;
  paragraphs: string[];
  link: string; // the visitor's booking page
};

function bookingHtml({ name, heading, paragraphs, link }: BookingEmail) {
  const body = paragraphs
    .map((p) => `<p style="margin:0 0 14px">${escapeHtml(p)}</p>`)
    .join('');
  return `
<div style="background:#f7f5f0;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#0a120b">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden">
    <div style="background:#12231a;padding:28px 32px">
      <p style="margin:0;color:#c5a86d;font-size:11px;letter-spacing:3px;text-transform:uppercase">Acacia Safaris</p>
      <h1 style="margin:10px 0 0;color:#ffffff;font-size:22px;font-weight:normal">${escapeHtml(heading)}</h1>
    </div>
    <div style="padding:28px 32px;font-size:15px;line-height:1.6">
      <p style="margin:0 0 14px">Hello ${escapeHtml(name)},</p>
      ${body}
      <p style="margin:24px 0"><a href="${escapeHtml(link)}" style="background:#c5a86d;color:#0e1d16;text-decoration:none;font-weight:bold;padding:13px 26px;border-radius:6px;display:inline-block">Open my booking</a></p>
      <p style="margin:0;color:#0a120b99;font-size:13px">Keep this email: the button is your private link to your booking and our conversation.</p>
    </div>
  </div>
</div>`;
}

export type ConfirmationEmail = {
  to: string;
  name: string;
  title: string; // the package, or the destinations
  image?: string | null;
  location?: string | null;
  description?: string | null; // the package overview
  tripType?: string | null; // e.g. "Private tour"
  lodging?: string | null; // e.g. "Luxury lodges"
  route: string[]; // stops in travel order
  dates: string; // "Mon 1 Dec – Sun 7 Dec 2026"
  duration?: string; // "7 days"
  travelers: string; // "2 adults, 1 child"
  guests: { label: string; count: number; price: number }[]; // price per group
  price: string; // "$7,250"
  payment: string; // e.g. "50% deposit ($3,625) holds your dates…"
  itinerary: {
    day: number;
    title: string;
    description: string;
    image?: string | null;
  }[];
  inclusions: string[];
  exclusions: string[];
  perks: string[];
  whyChoose: string[]; // "Title: explanation"
  ticketCode: string;
  qrPng: Buffer;
  quotationUrl?: string | null; // attached as a PDF when there is one
  link: string;
};

const GREEN = '#12231a';
const GOLD = '#c5a86d';
const INK = '#0a120b';
const MUTED = '#5e6960';
const CREAM = '#f7f5f0';
const WHATSAPP = '250798635578';

const usdText = (n: number) => `$${n.toLocaleString('en-US')}`;

// Emails are built with tables and inline styles: that is what every email app shows the same way
export function confirmationHtml(e: ConfirmationEmail) {
  const h = escapeHtml;

  const heading = (eyebrow: string, title: string) => `
    <tr><td style="padding:36px 32px 14px">
      <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#8e7345;font-weight:bold">${eyebrow}</p>
      <p style="margin:6px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:${INK}">${title}</p>
    </td></tr>`;

  const factCell = (label: string, value?: string | null) =>
    value
      ? `<td width="50%" style="padding:6px;vertical-align:top">
          <div style="background:${CREAM};border-radius:10px;padding:12px 14px">
            <p style="margin:0;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED}">${label}</p>
            <p style="margin:4px 0 0;font-size:14px;font-weight:bold;color:${INK}">${h(value)}</p>
          </div>
        </td>`
      : '';
  const facts = [
    factCell('Dates', e.dates),
    factCell('Duration', e.duration),
    factCell('Travelers', e.travelers),
    factCell('Trip type', e.tripType),
    factCell('Lodging', e.lodging),
    factCell('Location', e.location),
  ].filter(Boolean);
  const factRows: string[] = [];
  for (let i = 0; i < facts.length; i += 2) {
    factRows.push(
      `<tr>${facts[i]}${facts[i + 1] ?? '<td width="50%"></td>'}</tr>`,
    );
  }

  const route = e.route.length
    ? `<tr><td style="padding:4px 32px 0">
        <p style="margin:14px 0 8px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED}">Route</p>
        <p style="margin:0;font-size:14px;line-height:2;color:${INK}">${e.route
          .map(
            (stop) =>
              `<span style="display:inline-block;background:#ffffff;border:1px solid #e5ded0;border-radius:20px;padding:2px 12px;white-space:nowrap">${h(stop)}</span>`,
          )
          .join(
            ` <span style="color:${GOLD};font-weight:bold">&rarr;</span> `,
          )}</p>
      </td></tr>`
    : '';

  const priceRows = e.guests
    .filter((g) => g.count > 0)
    .map(
      (g) => `<tr>
        <td style="padding:7px 0;font-size:14px;color:${MUTED}">${g.count} &times; ${h(g.label)} <span style="color:#9aa39d">(${g.price > 0 ? usdText(g.price) : 'free'})</span></td>
        <td align="right" style="padding:7px 0;font-size:14px;color:${INK}">${g.price > 0 ? usdText(g.count * g.price) : 'Free'}</td>
      </tr>`,
    )
    .join('');

  const days = e.itinerary
    .map(
      (d, i) => `
      <tr><td style="padding:0 0 ${i === e.itinerary.length - 1 ? 0 : 14}px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ece6da;border-radius:12px;overflow:hidden;background:#ffffff">
          <tr>
            ${
              d.image
                ? `<td width="130" style="vertical-align:top;padding:0"><img src="${h(d.image)}" alt="" width="130" height="118" style="display:block;width:130px;height:118px;object-fit:cover;border-radius:12px 0 0 12px"></td>`
                : ''
            }
            <td style="vertical-align:top;padding:14px 16px">
              <p style="margin:0;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8e7345;font-weight:bold">Day ${d.day}</p>
              <p style="margin:3px 0 0;font-size:15px;font-weight:bold;color:${INK}">${h(d.title)}</p>
              <p style="margin:5px 0 0;font-size:13px;line-height:1.55;color:${MUTED}">${h(d.description)}</p>
            </td>
          </tr>
        </table>
      </td></tr>`,
    )
    .join('');

  const list = (items: string[], mark: string, color: string) =>
    items
      .map(
        (i) => `<tr>
          <td width="22" style="vertical-align:top;padding:5px 0;color:${color};font-weight:bold;font-size:14px">${mark}</td>
          <td style="padding:5px 0;font-size:13px;line-height:1.5;color:${INK}">${h(i)}</td>
        </tr>`,
      )
      .join('');

  const reasons = e.whyChoose
    .map((r) => {
      const split = r.indexOf(': ');
      const title = split > 0 ? r.slice(0, split) : '';
      const text = split > 0 ? r.slice(split + 2) : r;
      return `<tr><td style="padding:0 0 12px">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td width="30" style="vertical-align:top"><div style="width:22px;height:22px;border-radius:11px;background:${GOLD};color:${GREEN};text-align:center;font-size:12px;line-height:22px;font-weight:bold">&#9733;</div></td>
          <td style="vertical-align:top;font-size:13px;line-height:1.55;color:${MUTED}">${title ? `<strong style="color:${INK}">${h(title)}.</strong> ` : ''}${h(text)}</td>
        </tr></table>
      </td></tr>`;
    })
    .join('');

  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Booking confirmed</title></head>
<body style="margin:0;padding:0;background:${CREAM}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">Your trip ${h(e.title)} is confirmed. Your QR code ticket and every detail are inside.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};font-family:Arial,Helvetica,sans-serif;color:${INK}">
<tr><td align="center" style="padding:28px 10px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(10,18,11,0.08)">

  <!-- Header -->
  <tr><td style="background:${GREEN};padding:22px 32px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-family:Georgia,'Times New Roman',serif;font-size:18px;letter-spacing:4px;color:#ffffff">ACACIA <span style="color:${GOLD}">SAFARIS</span></td>
      <td align="right"><span style="display:inline-block;background:#1f5a42;color:#d6f5e3;font-size:11px;font-weight:bold;letter-spacing:1px;padding:6px 12px;border-radius:20px;white-space:nowrap">&#10003;&nbsp;CONFIRMED</span></td>
    </tr></table>
  </td></tr>

  <!-- Hero -->
  ${e.image ? `<tr><td style="padding:0"><img src="${h(e.image)}" alt="${h(e.title)}" width="600" style="display:block;width:100%;height:auto;max-height:300px;object-fit:cover"></td></tr>` : ''}
  <tr><td style="background:${GREEN};padding:26px 32px 30px">
    <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${GOLD}">Your trip is booked</p>
    <p style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.25;color:#ffffff">${h(e.title)}</p>
    <p style="margin:10px 0 0;font-size:14px;color:#ffffffb3">${h(e.dates)}${e.duration ? ` &nbsp;·&nbsp; ${h(e.duration)}` : ''}</p>
  </td></tr>

  <!-- Greeting -->
  <tr><td style="padding:30px 32px 0">
    <p style="margin:0;font-size:16px">Hello ${h(e.name)},</p>
    <p style="margin:10px 0 0;font-size:15px;line-height:1.65;color:${MUTED}">Wonderful news: your booking is <strong style="color:${INK}">confirmed</strong>. Below is your ticket and every detail of your trip. Please keep this email, you will need it on the day.</p>
  </td></tr>

  <!-- Ticket -->
  <tr><td style="padding:26px 32px 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${GREEN};border-radius:16px">
      <tr><td align="center" style="padding:26px 20px 8px">
        <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${GOLD}">Your ticket</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px auto 0"><tr><td style="background:#ffffff;border-radius:14px;padding:12px">
          <img src="cid:ticket-qr" alt="QR code ${h(e.ticketCode)}" width="190" height="190" style="display:block;width:190px;height:190px">
        </td></tr></table>
        <p style="margin:16px 0 0;font-family:'Courier New',Courier,monospace;font-size:24px;letter-spacing:6px;font-weight:bold;color:${GOLD}">${h(e.ticketCode)}</p>
      </td></tr>
      <tr><td style="padding:14px 24px 0"><div style="border-top:2px dashed #ffffff26"></div></td></tr>
      <tr><td align="center" style="padding:14px 28px 24px">
        <p style="margin:0;font-size:14px;line-height:1.6;color:#ffffff"><strong>Show this QR code on the day of your trip</strong></p>
        <p style="margin:4px 0 0;font-size:13px;line-height:1.6;color:#ffffffa6">Printed or on your phone. Our team scans it to welcome you.</p>
      </td></tr>
    </table>
  </td></tr>

  <!-- Trip at a glance -->
  ${heading('At a glance', 'Your trip')}
  <tr><td style="padding:0 26px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${factRows.join('')}</table>
  </td></tr>
  ${route}

  ${
    e.description
      ? `${heading('Overview', 'About this journey')}
  <tr><td style="padding:0 32px"><p style="margin:0;font-size:14px;line-height:1.7;color:${MUTED}">${h(e.description)}</p></td></tr>`
      : ''
  }

  <!-- Price -->
  ${heading('Price', 'Your total')}
  <tr><td style="padding:0 32px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};border-radius:12px">
      <tr><td style="padding:10px 18px 4px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${priceRows}</table>
      </td></tr>
      <tr><td style="padding:0 18px"><div style="border-top:1px solid #e5ded0"></div></td></tr>
      <tr><td style="padding:12px 18px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:14px;color:${MUTED}">Total</td>
          <td align="right" style="font-family:Georgia,'Times New Roman',serif;font-size:24px;color:${GREEN};font-weight:bold">${h(e.price)}</td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:0 18px 16px"><p style="margin:0;font-size:12px;line-height:1.55;color:${MUTED}">${h(e.payment)}</p></td></tr>
    </table>
  </td></tr>

  ${
    days
      ? `${heading('Itinerary', 'Day by day')}
  <tr><td style="padding:0 32px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${days}</table></td></tr>`
      : ''
  }

  ${
    e.inclusions.length || e.exclusions.length
      ? `${heading('What you get', 'Included and not included')}
  <tr><td style="padding:0 32px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      ${e.inclusions.length ? `<td width="50%" style="vertical-align:top;padding-right:10px"><p style="margin:0 0 6px;font-size:12px;font-weight:bold;color:#1f5a42">INCLUDED</p><table role="presentation" cellpadding="0" cellspacing="0">${list(e.inclusions, '&#10003;', '#1f5a42')}</table></td>` : ''}
      ${e.exclusions.length ? `<td width="50%" style="vertical-align:top;padding-left:10px"><p style="margin:0 0 6px;font-size:12px;font-weight:bold;color:#b4483c">NOT INCLUDED</p><table role="presentation" cellpadding="0" cellspacing="0">${list(e.exclusions, '&#10005;', '#b4483c')}</table></td>` : ''}
    </tr></table>
  </td></tr>`
      : ''
  }

  ${
    e.perks.length
      ? `${heading('Extras', 'Little things we add')}
  <tr><td style="padding:0 32px"><table role="presentation" cellpadding="0" cellspacing="0">${list(e.perks, '&#9670;', GOLD)}</table></td></tr>`
      : ''
  }

  ${
    reasons
      ? `${heading('Good to know', 'Why travelers love this trip')}
  <tr><td style="padding:0 32px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${reasons}</table></td></tr>`
      : ''
  }

  <!-- Reminder -->
  <tr><td style="padding:34px 32px 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf6ea;border:1px solid #ecdcb8;border-radius:14px">
      <tr><td style="padding:20px 22px">
        <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8e7345;font-weight:bold">On the day, remember to bring</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:10px">
          ${list(
            [
              'This QR code ticket, printed or on your phone',
              'A passport or ID for every traveler',
              'Comfortable walking shoes and a light rain jacket',
              'Sun protection, a refillable water bottle and your camera',
            ],
            '&#10003;',
            '#1f5a42',
          )}
        </table>
      </td></tr>
    </table>
  </td></tr>

  <!-- Buttons -->
  <tr><td align="center" style="padding:30px 32px 6px">
    <a href="${h(e.link)}" style="display:inline-block;background:${GOLD};color:#0e1d16;text-decoration:none;font-weight:bold;font-size:15px;padding:15px 34px;border-radius:8px">Open my booking</a>
  </td></tr>
  <tr><td align="center" style="padding:10px 32px 0">
    <a href="https://wa.me/${WHATSAPP}" style="font-size:13px;color:#1f5a42;text-decoration:none;font-weight:bold">Chat with us on WhatsApp</a>
    ${e.quotationUrl ? `<span style="color:#c8c2b4">&nbsp;·&nbsp;</span><span style="font-size:13px;color:${MUTED}">Full quotation attached (PDF)</span>` : ''}
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:30px 32px 26px">
    <div style="border-top:1px solid #ece6da;padding-top:18px;text-align:center">
      <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:14px;letter-spacing:3px;color:${GREEN}">ACACIA SAFARIS</p>
      <p style="margin:6px 0 0;font-size:12px;line-height:1.6;color:#9aa39d">Kigali, Rwanda &nbsp;·&nbsp; +250 798 635 578<br>Questions? Reply to this email or write to us from your booking page.</p>
    </div>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

export type ResetCodeEmail = {
  to: string;
  name: string;
  code: string;
  minutes: number; // how long the code works
};

function resetCodeHtml({ name, code, minutes }: ResetCodeEmail) {
  return `
<div style="background:#f7f5f0;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#0a120b">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden">
    <div style="background:#12231a;padding:28px 32px">
      <p style="margin:0;color:#c5a86d;font-size:11px;letter-spacing:3px;text-transform:uppercase">Acacia Safaris</p>
      <h1 style="margin:10px 0 0;color:#ffffff;font-size:22px;font-weight:normal">Reset your password</h1>
    </div>
    <div style="padding:28px 32px;font-size:15px;line-height:1.6">
      <p style="margin:0 0 14px">Hello ${escapeHtml(name)},</p>
      <p style="margin:0 0 14px">Use this code to reset the password of your Acacia Safaris admin account:</p>
      <p style="margin:24px 0;font-size:32px;font-weight:bold;letter-spacing:10px;color:#12231a">${escapeHtml(code)}</p>
      <p style="margin:0;color:#0a120b99;font-size:13px">The code works for ${minutes} minutes. If you did not ask for it, you can ignore this email: your password stays the same.</p>
    </div>
  </div>
</div>`;
}

function quotationHtml(name: string, packageTitle: string, pdfUrl: string) {
  const title = escapeHtml(packageTitle);
  return `
<div style="background:#f7f5f0;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#0a120b">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden">
    <div style="background:#12231a;padding:28px 32px">
      <p style="margin:0;color:#c5a86d;font-size:11px;letter-spacing:3px;text-transform:uppercase">Acacia Safaris</p>
      <h1 style="margin:10px 0 0;color:#ffffff;font-size:22px;font-weight:normal">Your quotation is ready</h1>
    </div>
    <div style="padding:28px 32px;font-size:15px;line-height:1.6">
      <p style="margin:0 0 14px">Hello ${escapeHtml(name)},</p>
      <p style="margin:0 0 14px">Thank you for your interest in <strong>${title}</strong>. Your quotation is attached, with the prices, what is included and what is not.</p>
      <p style="margin:24px 0"><a href="${escapeHtml(pdfUrl)}" style="background:#c5a86d;color:#0e1d16;text-decoration:none;font-weight:bold;padding:13px 26px;border-radius:6px;display:inline-block">Download quotation</a></p>
      <p style="margin:0;color:#0a120b99;font-size:13px">Have a question? Simply reply to this email or message us on WhatsApp.</p>
    </div>
  </div>
</div>`;
}
