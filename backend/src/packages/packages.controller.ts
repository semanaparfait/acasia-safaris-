import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../common/admin.guard';
import { PackageDto, QuotationEmailDto } from './dto/package.dto';
import { PackagesService } from './packages.service';

// Routes under /api/packages
@ApiTags('Packages')
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
  @ApiBearerAuth()
  findAll() {
    return this.packagesService.findAll();
  }

  // GET /api/packages/<id>
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.packagesService.findOne(id);
  }

  // POST /api/packages/<id>/quotation/email   (website: anyone can ask for it)
  @Post(':id/quotation/email')
  @HttpCode(200)
  emailQuotation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: QuotationEmailDto,
  ) {
    return this.packagesService.emailQuotation(id, dto);
  }

  // POST /api/packages/<id>/quotation   (admin: remake the PDF from the package)
  @Post(':id/quotation')
  @HttpCode(200)
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  generateQuotation(@Param('id', ParseUUIDPipe) id: string) {
    return this.packagesService.generateQuotation(id);
  }

  // POST /api/packages           (admin)
  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  create(@Body() dto: PackageDto) {
    return this.packagesService.create(dto);
  }

  // PUT /api/packages/<id>   (admin, send the whole package)
  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: PackageDto) {
    return this.packagesService.update(id, dto);
  }

  // DELETE /api/packages/<id>   (admin)
  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.packagesService.remove(id);
  }
}
