import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export const WORKER_ROLES = [
  'Tour Guide',
  'Driver',
  'Tour Manager',
  'Customer Support',
  'Admin',
];
export const WORKER_STATUSES = ['Active', 'On leave', 'Inactive'];

export class WorkerDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsIn(WORKER_ROLES)
  role: string;

  @IsArray()
  @IsString({ each: true })
  languages: string[];

  @IsOptional()
  @IsIn(WORKER_STATUSES)
  status?: string;

  // e.g. "2024-02-12"
  @IsOptional()
  @IsDateString()
  joined?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  // URL returned by POST /api/uploads/workers
  @IsOptional()
  @IsString()
  photo?: string;

  // Second role: true = can log in to the admin panel
  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  // Only sent when setting or changing the password. Leave it out to keep the old one.
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password?: string;
}
