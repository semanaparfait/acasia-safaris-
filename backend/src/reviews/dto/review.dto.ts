import {
  IsDateString,
  IsIn,
  IsUrl,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export const REVIEW_STATUSES = ['Pending', 'Published', 'Hidden'];

// What a guest sends. New reviews start as "Pending" until an admin publishes them.
export class CreateReviewDto {
  @IsString()
  name: string;

  @IsString()
  country: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  packageTitle?: string;

  @IsString()
  @MaxLength(2000)
  text: string;
}

// An admin adds a review copied from our Google profile (published at once)
export class GoogleReviewDto {
  @IsString()
  @MaxLength(80)
  name: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MaxLength(4000)
  text: string;

  // The review on Google Maps (Share > Copy link), shown as "Read on Google"
  @IsOptional()
  @IsUrl({ require_protocol: true, protocols: ['https'] })
  sourceUrl?: string;

  // When it was posted on Google (YYYY-MM-DD); empty = today
  @IsOptional()
  @IsDateString()
  postedAt?: string;
}

// What the admin sends to publish or hide a review
export class UpdateReviewDto {
  @IsIn(REVIEW_STATUSES)
  status: string;
}
