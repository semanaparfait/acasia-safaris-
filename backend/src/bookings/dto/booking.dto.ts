import {
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export const BOOKING_STATUSES = [
  'Pending',
  'Confirmed',
  'Completed',
  'Cancelled',
];
export const PAYMENT_STATUSES = ['Unpaid', 'Deposit', 'Paid', 'Refunded'];

// What a visitor sends from the website booking form.
// The end date and the price are NOT sent: the server works them out from the package.
export class CreateBookingDto {
  @IsString()
  customer: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  country: string;

  @IsUUID()
  packageId: string;

  // e.g. "2026-12-01"
  @IsDateString()
  startDate: string;

  @IsInt()
  @Min(1)
  @Max(50)
  travelers: number;

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

  @IsOptional()
  @IsString()
  notes?: string;
}
