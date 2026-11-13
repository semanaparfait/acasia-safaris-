import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

// Admin > Calendar: a to-do on a day
export class ReminderDto {
  @IsString()
  @IsNotEmpty({ message: 'Write what to do' })
  @MaxLength(160)
  title: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'The date must look like 2026-11-12',
  })
  date: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'The time must look like 14:30',
  })
  time?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;

  @IsOptional()
  @IsUUID()
  bookingId?: string | null;
}

export class ReminderDoneDto {
  @IsBoolean()
  done: boolean;
}
