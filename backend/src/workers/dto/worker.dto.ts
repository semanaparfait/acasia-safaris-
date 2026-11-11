import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export const WORKER_STATUSES = ['Active', 'On leave', 'Inactive'];

export const SOCIAL_NETWORKS = [
  'youtube',
  'instagram',
  'x',
  'tiktok',
  'snapchat',
  'facebook',
] as const;

// Links to the worker's profiles. Leave one out (or "") when they do not use it.
export class SocialsDto {
  @IsOptional()
  @IsUrl({}, { message: 'YouTube must be a link' })
  youtube?: string;
  @IsOptional()
  @IsUrl({}, { message: 'Instagram must be a link' })
  instagram?: string;
  @IsOptional() @IsUrl({}, { message: 'X must be a link' }) x?: string;
  @IsOptional()
  @IsUrl({}, { message: 'TikTok must be a link' })
  tiktok?: string;
  @IsOptional()
  @IsUrl({}, { message: 'Snapchat must be a link' })
  snapchat?: string;
  @IsOptional()
  @IsUrl({}, { message: 'Facebook must be a link' })
  facebook?: string;
}

export class WorkerDto {
  @IsString()
  name: string;

  // The company email (the login) is not sent: the server makes it from the first name,
  // e.g. "Jean Bosco Habimana" -> "jean@acaciasafaris.com".
  // This is the worker's own email, where the forgot-password code is sent.
  @IsEmail()
  personalEmail: string;

  @IsString()
  phone: string;

  // Name of a role from Admin > Roles (checked in WorkersService)
  @IsString()
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

  // About us page: shown there when true (needs a companyRole)
  @IsOptional()
  @IsBoolean()
  showOnWebsite?: boolean;

  // Title on the website, e.g. "CEO & Founder"
  @IsOptional()
  @IsString()
  @MaxLength(80)
  companyRole?: string;

  // Short text for visitors
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialsDto)
  socials?: SocialsDto;

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
