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
  Query,
  UseGuards,
} from '@nestjs/common';
import { isLang } from '../translations/content';
import { Audit } from '../audit/audit.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../common/admin.guard';
import { PackageDto, QuotationEmailDto } from './dto/package.dto';
import { PackagesService } from './packages.service';
import { FormLimit } from '../common/limits';

// Routes under /api/packages
@ApiTags('Packages')
@Controller('packages')
export class PackagesController {
  constructor(private packagesService: PackagesService) {}

  // GET /api/packages?lang=fr    (website: published packages, translated; no lang = English)
  @Get()
  findPublished(@Query('lang') lang?: string) {
    return this.packagesService.findPublished(isLang(lang) ? lang : undefined);
  }

  // GET /api/packages/all        (admin: drafts included)
  // Must be declared before ':id', otherwise "all" would be read as an id.
  @Get('all')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  findAll() {
    return this.packagesService.findAll();
  }

  // GET /api/packages/all/<id>   (admin: one package, with its lowest bargaining price)
  @Get('all/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  findOneForAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.packagesService.findOneForAdmin(id);
  }

  // GET /api/packages/<id>?lang=fr
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('lang') lang?: string,
  ) {
    return this.packagesService.findOneLocalized(
      id,
      isLang(lang) ? lang : undefined,
    );
  }

  // POST /api/packages/<id>/quotation/email   (website: anyone can ask for it)
  @Post(':id/quotation/email')
  @FormLimit()
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
  @Audit('Remade the quotation PDF', 'Package')
  generateQuotation(@Param('id', ParseUUIDPipe) id: string) {
    return this.packagesService.generateQuotation(id);
  }

  // POST /api/packages           (admin)
  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Added a package', 'Package')
  create(@Body() dto: PackageDto) {
    return this.packagesService.create(dto);
  }

  // PUT /api/packages/<id>   (admin, send the whole package)
  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Edited a package', 'Package')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: PackageDto) {
    return this.packagesService.update(id, dto);
  }

  // DELETE /api/packages/<id>   (admin)
  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Audit('Deleted a package', 'Package')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.packagesService.remove(id);
  }
}
