import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../common/admin.guard';
import { Access } from '../common/permissions';
import { AnalyticsService, RANGES, type Range } from './analytics.service';

// GET /api/analytics?range=7d   (admins only; range: today | 7d | 30d | 90d)
// -> { connected: false, reason } until UMAMI_API_KEY and UMAMI_WEBSITE_ID are set
// &fresh=1 skips the few minutes the numbers are kept
@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Access('statistics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private analytics: AnalyticsService) {}

  @Get()
  report(@Query('range') range?: string, @Query('fresh') fresh?: string) {
    const r: Range = RANGES.includes(range as Range) ? (range as Range) : '7d';
    return this.analytics.report(r, fresh === '1');
  }
}
