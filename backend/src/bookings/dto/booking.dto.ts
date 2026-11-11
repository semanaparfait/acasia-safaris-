import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export const BOOKING_STATUSES = [
  'Pending',
  'Negotiating', // the visitor or the team proposed another price
  'Confirmed',
  'Completed',
  'Cancelled',
];
export const PAYMENT_STATUSES = ['Unpaid', 'Deposit', 'Paid', 'Refunded'];

// One destination of the trip and what the visitor chose for it
export class BookingDestinationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  travelStyle: string;

  @IsString()
  @IsNotEmpty()
  accommodation: string;

  @IsString()
  @IsNotEmpty()
  budget: string;
}

// Package bookings: how many travelers in each price group of the package
// (the groups of its quotation: "Adult", "Teenager", "Child", "Infant")
export class GuestGroupDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsInt()
  @Min(0)
  @Max(50)
  count: number;
}

// What a visitor sends from the website. A booking is for a package, or for destinations:
// - packageId: the end date and the price are worked out from the package
// - destinations + endDate: the admin sets the price afterwards
export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  customer: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsOptional()
  @IsUUID()
  packageId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BookingDestinationDto)
  destinations?: BookingDestinationDto[];

  // e.g. "2026-12-01"
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsInt()
  @Min(1)
  @Max(50)
  travelers: number;

  // How many of the travelers are children
  @IsOptional()
  @IsInt()
  @Min(0)
  children?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  // Package bookings: travelers per price group. The server works out the price from them.
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestGroupDto)
  guests?: GuestGroupDto[];

  // Package bookings: the visitor asks for a better price (total in USD)
  @IsOptional()
  @IsInt()
  @Min(1)
  offer?: number;

  // Why they ask for it, e.g. "We are a group of students"
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  offerNote?: string;
}

// A message on a booking, from the visitor (booking page) or the team (admin).
// With "offer", it also proposes a new total price.
export class BookingMessageDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  text?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  offer?: number;
}

// What the admin sends to change a booking. Every field is optional.
export class UpdateBookingDto {
  @IsOptional()
  @IsIn(BOOKING_STATUSES)
  status?: string;

  @IsOptional()
  @IsIn(PAYMENT_STATUSES)
  payment?: string;

  // Total price in USD
  @IsOptional()
  @IsInt()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
