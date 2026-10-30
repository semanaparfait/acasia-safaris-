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
import { ChangePasswordDto, UpdateAccountDto } from './dto/account.dto';

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
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  // GET /api/auth/me   -> the logged-in worker
  @Get('me')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  me(@Req() request: AdminRequest) {
    return request.worker;
  }

  // PATCH /api/auth/me   body: { "name": "...", "phone": "..." }
  // Changing the email also needs "currentPassword"
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
