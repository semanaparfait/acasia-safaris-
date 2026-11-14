import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// Admin > Departures: a package on a fixed date that travelers can join
export class CreateDepartureDto {
  @IsUUID()
  packageId: string;

  // e.g. "2026-12-01"
  @IsDateString()
  startDate: string;

  // The most travelers on this trip
  @IsInt()
  @Min(1)
  @Max(100)
  seats: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;

  @IsOptional()
  @IsBoolean()
  open?: boolean;
}

export class UpdateDepartureDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  seats?: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;

  @IsOptional()
  @IsBoolean()
  open?: boolean;
}
