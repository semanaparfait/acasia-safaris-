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
