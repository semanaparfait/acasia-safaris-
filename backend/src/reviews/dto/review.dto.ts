import {
  IsIn,
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

// What the admin sends to publish or hide a review
export class UpdateReviewDto {
  @IsIn(REVIEW_STATUSES)
  status: string;
}
