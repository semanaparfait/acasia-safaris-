import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class DestinationDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  group: string;

  @IsString()
  location: string;

  @IsString()
  image: string;

  @IsArray()
  @IsString({ each: true })
  highlights: string[];

  @IsString()
  bestTime: string;

  @IsString()
  fromKigali: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  // Choices on the booking form. Empty = the website uses the defaults for the group.
  @IsArray()
  @IsString({ each: true })
  travelStyles: string[];

  @IsArray()
  @IsString({ each: true })
  accommodations: string[];

  @IsArray()
  @IsString({ each: true })
  budgets: string[];
}
