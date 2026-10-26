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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../common/admin.guard';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { ReviewsService } from './reviews.service';

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
  create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto);
  }

  // PATCH /api/reviews/4   body: { "status": "Published" }   (admin)
  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.remove(id);
  }
}
