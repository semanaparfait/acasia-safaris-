import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
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
