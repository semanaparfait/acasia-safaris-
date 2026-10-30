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
  Min,
  ValidateNested,
} from 'class-validator';

export const BOOKING_STATUSES = [
  'Pending',
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
