import {
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
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
}
