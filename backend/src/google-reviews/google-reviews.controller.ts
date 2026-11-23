import {
  Body,
  Controller,
  Get,
  Header,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsUrl,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { Audit } from '../audit/audit.decorator';
import { AdminGuard } from '../common/admin.guard';
import { GoogleReviewsService } from './google-reviews.service';

class GoogleProfileDto {
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(5)
  rating: number;

  @IsInt()
  @Min(0)
  total: number;

  @IsOptional()
  @ValidateIf((o: GoogleProfileDto) => Boolean(o.mapsUrl))
  @IsUrl({ require_protocol: true, protocols: ['https'] })
  mapsUrl?: string;
}

@ApiTags('Google reviews')
@Controller('google-reviews')
export class GoogleReviewsController {
  constructor(private googleReviews: GoogleReviewsService) {}

  // GET /api/google-reviews?lang=fr   (website)
  // -> { available: true, rating, total, mapsUrl, reviews: [...] }  or  { available: false }
  // From the Google API when it works, otherwise what admins typed in Admin > Reviews
  @Get()
  @Header('Cache-Control', 'public, max-age=300')
  get(@Query('lang') lang?: string) {
    return this.googleReviews.get(lang ?? 'en');
  }

  // GET /api/google-reviews/profile   (admin) -> { rating, total, mapsUrl }
  @Get('profile')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  profile() {
    return this.googleReviews.getProfile();
  }

  // PUT /api/google-reviews/profile   body: { "rating": 4.9, "total": 132, "mapsUrl"?: "https://..." }
  @Put('profile')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Updated the Google rating')
  setProfile(@Body() dto: GoogleProfileDto) {
    return this.googleReviews.setProfile({
      rating: dto.rating,
      total: dto.total,
      mapsUrl: dto.mapsUrl ?? null,
    });
  }
}
