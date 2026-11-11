import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WorkersService } from './workers.service';

// GET /api/team (public): the workers shown on the About us page.
// Only name, company role, photo, bio, personal email, phone, languages and social links.
@ApiTags('Workers')
@Controller('team')
export class TeamController {
  constructor(private workersService: WorkersService) {}

  @Get()
  team() {
    return this.workersService.team();
  }
}
