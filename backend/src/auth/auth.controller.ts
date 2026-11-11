import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsJWT,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import type { Request, Response } from 'express';
import { Audit } from '../audit/audit.decorator';
import { AdminGuard, type AdminRequest } from '../common/admin.guard';
import { LoginLimit, ResetCodeLimit, ResetEmailLimit } from '../common/limits';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdateAccountDto,
  VerifyResetCodeDto,
} from './dto/account.dto';
import {
  DEVICE_COOKIE,
  clearSession,
  cookie,
  setSession,
  setTrustedDevice,
} from './session';

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

class LoginCodeDto {
  @IsJWT()
  challenge: string;

  @Matches(/^\d{6}$/, { message: 'The code has 6 digits' })
  code: string;

  // Trust this browser for 30 days (no code)
  @IsOptional()
  @IsBoolean()
  remember?: boolean;
}

class ResendLoginCodeDto {
  @IsJWT()
  challenge: string;
}

// Routes under /api/auth.
// The login is kept in an httpOnly cookie (see session.ts): the page never sees the token.
// Tools like Swagger can still send "Authorization: Bearer <token>".
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Login, step 1: POST /api/auth/login   body: { "email": "...", "password": "..." }
  // -> { twoStep: true, challenge, sentTo }: a 6 digit code was emailed (step 2 below)
  // -> { worker }: logged in at once (this browser is trusted)
  @Post('login')
  @LoginLimit()
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto.email, dto.password, {
      ip: req.ip,
      deviceToken: cookie(req, DEVICE_COOKIE),
    });
    if ('twoStep' in result) return result;
    setSession(res, result.token);
    return { worker: result.worker };
  }

  // Login, step 2: POST /api/auth/login/verify   body: { "challenge": "...", "code": "123456", "remember": true }
  // -> { worker } and the login cookie
  @Post('login/verify')
  @ResetCodeLimit()
  @HttpCode(200)
  async verifyLogin(
    @Body() dto: LoginCodeDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyLogin(
      dto.challenge,
      dto.code,
      Boolean(dto.remember),
      { ip: req.ip },
    );
    setSession(res, result.token);
    if (result.deviceToken) setTrustedDevice(res, result.deviceToken);
    return { worker: result.worker };
  }

  // POST /api/auth/login/resend   body: { "challenge": "..." }   -> a new code (once a minute)
  @Post('login/resend')
  @ResetEmailLimit()
  @HttpCode(200)
  resendLoginCode(@Body() dto: ResendLoginCodeDto) {
    return this.authService.resendLoginCode(dto.challenge);
  }

  // Forgot password, in 3 steps (no login needed):
  // POST /api/auth/forgot-password   body: { "email": "<company email>" }
  // Emails a 6 digit code to the worker's personal email and returns
  // { sentTo: "sh********it@gmail.com" }. 404 if no worker has this company email.
  @Post('forgot-password')
  @ResetEmailLimit()
  @HttpCode(200)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  // POST /api/auth/verify-reset-code   body: { "email": "...", "code": "123456" }
  // Checks the code (it is not used up). 400 if it is wrong or expired.
  @Post('verify-reset-code')
  @ResetCodeLimit()
  @HttpCode(200)
  verifyResetCode(@Body() dto: VerifyResetCodeDto) {
    return this.authService.verifyResetCode(dto.email, dto.code);
  }

  // POST /api/auth/reset-password   body: { "email": "...", "code": "123456", "newPassword": "..." }
  // Sets the new password, logs out every device, and logs this one in -> { worker }
  @Post('reset-password')
  @ResetCodeLimit()
  @HttpCode(200)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.resetPassword(
      dto.email,
      dto.code,
      dto.newPassword,
    );
    setSession(res, result.token);
    return { worker: result.worker };
  }

  // GET /api/auth/me   -> the logged-in worker
  @Get('me')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  me(@Req() request: AdminRequest) {
    return request.worker;
  }

  // GET /api/auth/live-token   -> { token } to open the live connection (valid 2 minutes)
  @Get('live-token')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  liveToken(@Req() request: AdminRequest) {
    return this.authService.liveToken(request.worker.id);
  }

  // PATCH /api/auth/me   body: { "name": "...", "phone": "..." }
  // Changing "personalEmail" also needs "currentPassword"
  @Patch('me')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Edited their own account')
  updateAccount(@Req() request: AdminRequest, @Body() dto: UpdateAccountDto) {
    return this.authService.updateAccount(request.worker.id, dto);
  }

  // PATCH /api/auth/me/password   body: { "currentPassword": "...", "newPassword": "..." }
  // Other devices are logged out (trusted devices too); this one stays logged in -> { worker }
  @Patch('me/password')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Changed their password')
  async changePassword(
    @Req() request: AdminRequest,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.changePassword(
      request.worker.id,
      dto,
    );
    setSession(res, result.token);
    return { worker: result.worker };
  }

  // POST /api/auth/logout   -> ends the login on every device
  @Post('logout')
  @HttpCode(200)
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Logged out')
  async logout(
    @Req() request: AdminRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    clearSession(res);
    return this.authService.logout(request.worker.id);
  }
}
