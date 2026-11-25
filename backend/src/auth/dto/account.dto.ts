import { Type } from 'class-transformer';
import {
  IsEmail,
  Matches,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { SocialsDto } from '../../workers/dto/worker.dto';

// What an admin can change on their own account. Every field is optional.
// Role, status and admin access are changed in Admin > Workers instead.
export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  // Personal email, where the forgot-password code is sent.
  // The company email (the login) is made by the server and cannot be changed here.
  @IsOptional()
  @IsEmail()
  personalEmail?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phone?: string;

  // URL returned by POST /api/uploads/workers, or "" to remove the photo
  @IsOptional()
  @IsString()
  photo?: string;

  // About us page: a few lines for visitors, shown when the main admin puts
  // this worker on the website (Admin > Workers). "" removes it.
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  // Links to their social profiles (empty ones are removed)
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialsDto)
  socials?: SocialsDto;

  // Private notes: never on the website (admins who manage workers see them). "" removes them.
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  // Needed to change the personal email, because it can reset the password
  @IsOptional()
  @IsString()
  currentPassword?: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  newPassword: string;
}

// Forgot password, step 1: the company email (the login)
export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

// Step 2: the 6 digit code from the personal email
export class VerifyResetCodeDto {
  @IsEmail()
  email: string;

  @Matches(/^\d{6}$/, { message: 'The code has 6 digits' })
  code: string;
}

// Step 3: the same code again, with the new password
export class ResetPasswordDto extends VerifyResetCodeDto {
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  newPassword: string;
}
