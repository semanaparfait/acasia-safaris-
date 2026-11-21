import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class TripDayDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  description?: string;
}

// One price option, e.g. "Standard", "Comfort", "Luxury", each with what it covers
export class TripPriceDto {
  @IsString()
  @MaxLength(80)
  name: string;

  // USD
  @IsInt()
  @Min(0)
  price: number;

  // e.g. "per person", "per couple"
  @IsOptional()
  @IsString()
  @MaxLength(60)
  unit?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  description?: string;

  // Highlighted as "Most popular" on the website
  @IsOptional()
  @IsBoolean()
  popular?: boolean;

  @IsArray()
  @ArrayMaxSize(60)
  @IsString({ each: true })
  @MaxLength(300, { each: true })
  included: string[];

  @IsArray()
  @ArrayMaxSize(60)
  @IsString({ each: true })
  @MaxLength(300, { each: true })
  excluded: string[];
}

// Admin > Trips: the whole trip is sent on create and on save
export class TripDto {
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  tagline?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  location: string;

  @IsString()
  @MinLength(10)
  @MaxLength(8000)
  description: string;

  // "2026-12-20", or null for flexible dates
  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  duration?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  groupSize?: string;

  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  images: string[];

  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(300, { each: true })
  highlights: string[];

  @IsArray()
  @ArrayMaxSize(60)
  @ValidateNested({ each: true })
  @Type(() => TripDayDto)
  itinerary: TripDayDto[];

  @IsArray()
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => TripPriceDto)
  prices: TripPriceDto[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class TripActiveDto {
  @IsBoolean()
  active: boolean;
}
