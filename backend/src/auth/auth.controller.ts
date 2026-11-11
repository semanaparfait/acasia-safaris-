import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { AdminGuard, type AdminRequest } from '../common/admin.guard';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdateAccountDto,
  VerifyResetCodeDto,
} from './dto/account.dto';
import { LoginLimit, ResetCodeLimit, ResetEmailLimit } from '../common/limits';

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

// Routes under /api/auth
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // POST /api/auth/login   body: { "email": "...", "password": "..." }
  // Returns { token, worker }. Send the token on admin requests:
  //   Authorization: Bearer <token>
  @Post('login')
  @LoginLimit()
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
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
  // Sets the new password, logs out every device and returns { token, worker } (logged in)
  @Post('reset-password')
  @ResetCodeLimit()
  @HttpCode(200)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.code, dto.newPassword);
  }

  // GET /api/auth/me   -> the logged-in worker
  @Get('me')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  me(@Req() request: AdminRequest) {
    return request.worker;
  }

  // PATCH /api/auth/me   body: { "name": "...", "phone": "..." }
  // Changing "personalEmail" also needs "currentPassword"
  @Patch('me')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  updateAccount(@Req() request: AdminRequest, @Body() dto: UpdateAccountDto) {
    return this.authService.updateAccount(request.worker.id, dto);
  }

  // PATCH /api/auth/me/password   body: { "currentPassword": "...", "newPassword": "..." }
  // Returns { token, worker }: other devices are logged out
  @Patch('me/password')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  changePassword(@Req() request: AdminRequest, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(request.worker.id, dto);
  }

  // POST /api/auth/logout   -> ends the login on every device
  @Post('logout')
  @HttpCode(200)
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  logout(@Req() request: AdminRequest) {
    return this.authService.logout(request.worker.id);
  }
}
