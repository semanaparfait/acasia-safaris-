import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

// What an admin can change on their own account. Every field is optional.
// Role, status and admin access are changed in Admin > Workers instead.
export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phone?: string;

  // URL returned by POST /api/uploads/workers, or "" to remove the photo
  @IsOptional()
  @IsString()
  photo?: string;

  // Needed to change the email, because the email is the login
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
