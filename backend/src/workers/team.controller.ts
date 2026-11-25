import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { isLang } from '../translations/content';
import { WorkersService } from './workers.service';

// GET /api/team (public): the workers shown on the About us page.
// Only name, company role, photo, bio, personal email, phone, languages and social links.
@ApiTags('Workers')
@Controller('team')
export class TeamController {
  constructor(private workersService: WorkersService) {}

  // ?lang=fr / ?lang=sw: titles and bios in that language
  @Get()
  team(@Query('lang') lang?: string) {
    return this.workersService.team(isLang(lang) ? lang : undefined);
  }
}
