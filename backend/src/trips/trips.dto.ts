import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
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

  // In the trip's currency (up to 2 decimals, e.g. 99.5 EUR)
  @IsNumber({ maxDecimalPlaces: 2 })
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

  // ISO code of the prices' currency: "RWF", "USD", "EUR", "UGX"…
  @IsOptional()
  @Matches(/^[A-Z]{3}$/, {
    message: 'currency must be a 3-letter code such as RWF or USD',
  })
  currency?: string;

  // The most travelers; null = no limit
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  seats?: number | null;

  // Early bird: earlyBirdPercent % off for bookings made until earlyBirdUntil (both or neither)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  earlyBirdPercent?: number | null;

  @IsOptional()
  @IsDateString()
  earlyBirdUntil?: string | null;

  // Groups: groupPercent % off from groupMinTravelers travelers (both or neither)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  groupPercent?: number | null;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(100)
  groupMinTravelers?: number | null;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class TripActiveDto {
  @IsBoolean()
  active: boolean;
}

export const TRIP_BOOKING_STATUSES = ['New', 'Confirmed', 'Cancelled'];
export const TRIP_PAYMENT_STATUSES = ['Unpaid', 'Deposit', 'Paid', 'Refunded'];

// A visitor reserves a trip from its page
export class CreateTripBookingDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  customer: string;

  @IsEmail()
  @MaxLength(200)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  // The price option's name, e.g. "Full package"
  @IsString()
  @MaxLength(80)
  option: string;

  @IsInt()
  @Min(1)
  @Max(50)
  travelers: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  @IsOptional()
  @IsIn(['en', 'fr', 'sw'])
  locale?: string;
}

// Admin > Trips > Bookings
export class UpdateTripBookingDto {
  @IsOptional()
  @IsIn(TRIP_BOOKING_STATUSES)
  status?: string;

  @IsOptional()
  @IsIn(TRIP_PAYMENT_STATUSES)
  payment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  travelers?: number;
}

// A visitor joins the waitlist of a full trip
export class JoinWaitlistDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  customer: string;

  @IsEmail()
  @MaxLength(200)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsInt()
  @Min(1)
  @Max(50)
  travelers: number;

  @IsOptional()
  @IsIn(['en', 'fr', 'sw'])
  locale?: string;
}

// After the trip: the traveler's review from /trip-review/<token>
export class TripReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  country: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  text: string;
}
