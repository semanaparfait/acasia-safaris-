import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  // Website: only published reviews
  findPublished() {
    return this.prisma.review.findMany({
      where: { status: 'Published' },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Admin: all reviews
  findAll() {
    return this.prisma.review.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException(`Review ${id} not found`);
    return review;
  }

  create(dto: CreateReviewDto) {
    return this.prisma.review.create({ data: { ...dto, status: 'Pending' } });
  }

  async update(id: number, dto: UpdateReviewDto) {
    await this.findOne(id);
    return this.prisma.review.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.review.delete({ where: { id } });
    return { deleted: true };
  }
}
