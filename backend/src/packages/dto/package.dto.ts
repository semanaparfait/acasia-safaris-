import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

// What the admin sends to create or update a package.
// The ValidationPipe (main.ts) rejects the request if a rule below fails.

export class ItineraryDayDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  image: string;
}

// One row of the prices table, e.g. Child, 4 to 11 years, $350
export class RateDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  ages: string;

  @IsInt()
  @Min(0)
  price: number;
}

export class PackageDto {
  @IsString()
  title: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsString()
  location: string;

  @IsString()
  description: string;

  @IsString()
  tripType: string;

  @IsString()
  lodging: string;

  @IsString()
  image: string;

  @IsInt()
  @Min(0)
  price: number;

  // URL returned by POST /api/uploads/tourpackages (a PDF), or null for none
  @IsOptional()
  @IsString()
  quotation?: string | null;

  // Prices in the quotation PDF. The first row is the adult price.
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RateDto)
  rates?: RateDto[] | null;

  // Reasons for "Why this price is fair", e.g. "Private vehicle: yours alone"
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fairPrice?: string[];

  @IsBoolean()
  active: boolean;

  @IsArray()
  @IsString({ each: true })
  route: string[];

  @IsArray()
  @IsString({ each: true })
  inclusions: string[];

  @IsArray()
  @IsString({ each: true })
  exclusions: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  perks?: string[];

  // Days in order. Day numbers are given by the position: first = Day 1.
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItineraryDayDto)
  itinerary: ItineraryDayDto[];
}

// What a visitor sends to get the quotation by email
export class QuotationEmailDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;
}
