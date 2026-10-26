import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

// What a visitor sends from the contact form
export class CreateMessageDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MaxLength(200)
  subject: string;

  @IsString()
  @MaxLength(5000)
  body: string;

  @IsOptional()
  @IsIn(['Contact form', 'Booking request', 'WhatsApp'])
  source?: string;
}

// What the admin sends to mark a message read / starred
export class UpdateMessageDto {
  @IsOptional()
  @IsBoolean()
  read?: boolean;

  @IsOptional()
  @IsBoolean()
  starred?: boolean;
}
