import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Audit } from '../audit/audit.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../common/admin.guard';
import {
  CreateReviewDto,
  GoogleReviewDto,
  UpdateReviewDto,
} from './dto/review.dto';
import { ReviewsService } from './reviews.service';
import { FormLimit } from '../common/limits';

// Routes under /api/reviews
@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  // GET /api/reviews   (website: published reviews)
  @Get()
  findPublished() {
    return this.reviewsService.findPublished();
  }

  // GET /api/reviews/all   (admin)
  @Get('all')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  findAll() {
    return this.reviewsService.findAll();
  }

  // POST /api/reviews   (website: a guest leaves a review)
  @Post()
  @FormLimit()
  create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto);
  }

  // POST /api/reviews/google   (admin: a review copied from our Google profile)
  // body: { "name", "rating", "text", "sourceUrl"?, "postedAt"? }
  @Post('google')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Added a Google review', 'Review')
  createGoogle(@Body() dto: GoogleReviewDto) {
    return this.reviewsService.createGoogle(dto);
  }

  // PATCH /api/reviews/4   body: { "status": "Published" }   (admin)
  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Changed a review', 'Review')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Deleted a review', 'Review')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.remove(id);
  }
}
