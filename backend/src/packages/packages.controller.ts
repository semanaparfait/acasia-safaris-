import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../common/admin.guard';
import { PackageDto } from './dto/package.dto';
import { PackagesService } from './packages.service';

// Routes under /api/packages
@Controller('packages')
export class PackagesController {
  constructor(private packagesService: PackagesService) {}

  // GET /api/packages            (website: published packages)
  @Get()
  findPublished() {
    return this.packagesService.findPublished();
  }

  // GET /api/packages/all        (admin: drafts included)
  // Must be declared before ':id', otherwise "all" would be read as an id.
  @Get('all')
  @UseGuards(AdminGuard)
  findAll() {
    return this.packagesService.findAll();
  }

  // GET /api/packages/7-day-gorilla
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packagesService.findOne(id);
  }

  // POST /api/packages           (admin)
  @Post()
  @UseGuards(AdminGuard)
  create(@Body() dto: PackageDto) {
    return this.packagesService.create(dto);
  }

  // PUT /api/packages/7-day-gorilla   (admin, send the whole package)
  @Put(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() dto: PackageDto) {
    return this.packagesService.update(id, dto);
  }

  // DELETE /api/packages/7-day-gorilla   (admin)
  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.packagesService.remove(id);
  }
}
