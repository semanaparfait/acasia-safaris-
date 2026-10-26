import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { IsEmail, IsString } from 'class-validator';
import { AdminGuard, type AdminRequest } from '../common/admin.guard';
import { AuthService } from './auth.service';

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

// Routes under /api/auth
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
  me(@Req() request: AdminRequest) {
    return request.worker;
  }
}
