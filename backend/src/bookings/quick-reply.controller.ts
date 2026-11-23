import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import type { Request, Response } from 'express';
import { cookie, REPLY_DEVICE_COOKIE, setReplyDevice } from '../auth/session';
import { ChatLimit, ResetCodeLimit } from '../common/limits';
import { BookingMessageDto } from './dto/booking.dto';
import { QuickReplyService } from './quick-reply.service';

class ReplyPinDto {
  @Matches(/^\d{4}$/, { message: 'The PIN has 4 digits' })
  pin: string;
}

// Routes under /api/quick-reply: an admin answering a customer from the link in an alert.
// No login: the link (48 hours, one admin, one booking) + the PIN once per device.
@ApiTags('Quick reply')
@Controller('quick-reply')
export class QuickReplyController {
  constructor(private quickReply: QuickReplyService) {}

  // GET /api/quick-reply/<token>
  // -> { trusted: false, workerName, pinSet }  or  { trusted: true, workerName, booking }
  @Get(':token')
  open(@Param('token') token: string, @Req() req: Request) {
    return this.quickReply.open(token, cookie(req, REPLY_DEVICE_COOKIE));
  }

  // POST /api/quick-reply/<token>/pin   body: { "pin": "1234" }  -> trusts this device 30 days
  @Post(':token/pin')
  @ResetCodeLimit()
  @HttpCode(200)
  async unlock(
    @Param('token') token: string,
    @Body() dto: ReplyPinDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { deviceToken, result } = await this.quickReply.unlock(
      token,
      dto.pin,
      req.ip,
    );
    setReplyDevice(res, deviceToken);
    return result;
  }

  // POST /api/quick-reply/<token>/messages   body: { "text": "...", "offer"?: 6000 }
  @Post(':token/messages')
  @ChatLimit()
  reply(
    @Param('token') token: string,
    @Body() dto: BookingMessageDto,
    @Req() req: Request,
  ) {
    return this.quickReply.reply(
      token,
      cookie(req, REPLY_DEVICE_COOKIE),
      dto,
      req.ip,
    );
  }

  // POST /api/quick-reply/<token>/accept   -> accepts the customer's price
  @Post(':token/accept')
  @ChatLimit()
  @HttpCode(200)
  accept(@Param('token') token: string, @Req() req: Request) {
    return this.quickReply.accept(
      token,
      cookie(req, REPLY_DEVICE_COOKIE),
      req.ip,
    );
  }
}
