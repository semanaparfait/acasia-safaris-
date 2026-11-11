import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RatesService } from './rates.service';

// GET /api/rates (public): { base: "USD", rates: { USD: 1, EUR: 0.92, ... }, updatedAt }
// Rates by Exchange Rate API (https://www.exchangerate-api.com)
@ApiTags('Rates')
@Controller('rates')
export class RatesController {
  constructor(private rates: RatesService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=3600')
  get() {
    return this.rates.get();
  }
}
