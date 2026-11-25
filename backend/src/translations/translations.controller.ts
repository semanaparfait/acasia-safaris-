import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Audit } from '../audit/audit.decorator';
import { AdminGuard, type AdminRequest } from '../common/admin.guard';
import { OwnerOnly, checkAccess } from '../common/permissions';
import { isLang, type Kind } from './content';
import { TRANSLATION_ERROR } from './machine-translate';
import { SaveTranslationsDto } from './translations.dto';
import { TranslationsService } from './translations.service';

// French and Swahili texts of packages and destinations (admin).
//   GET  /api/translations/packages/<id>             every text, its translations and their status
//   PUT  /api/translations/packages/<id>/fr          save corrections { values: { "<key>": "text" } }
//   POST /api/translations/packages/<id>/refresh     translate what is missing now (Google)
//   POST /api/translations/refresh-all               the same for every package and destination
// Same routes with "destinations" instead of "packages".
@ApiTags('Translations')
@Controller('translations')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class TranslationsController {
  constructor(private translations: TranslationsService) {}

  @Post('refresh-all')
  @OwnerOnly()
  @HttpCode(200)
  @Audit('Translated all packages and destinations')
  refreshAll() {
    return this.translations.refreshAll();
  }

  @Get(':kind/:id')
  get(
    @Req() request: AdminRequest,
    @Param('kind') kind: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.translations.forAdmin(toKind(kind, request), id);
  }

  @Put(':kind/:id/:lang')
  @Audit('Edited translations')
  save(
    @Req() request: AdminRequest,
    @Param('kind') kind: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('lang') lang: string,
    @Body() dto: SaveTranslationsDto,
  ) {
    if (!isLang(lang))
      throw new BadRequestException('Language must be "fr" or "sw"');
    return this.translations.save(toKind(kind, request), id, lang, dto.values);
  }

  @Post(':kind/:id/refresh')
  @HttpCode(200)
  async refresh(
    @Req() request: AdminRequest,
    @Param('kind') kind: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    try {
      return await this.translations.refresh(toKind(kind, request), id);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.startsWith(TRANSLATION_ERROR)
      ) {
        throw new BadRequestException(`Could not translate: ${error.message}`);
      }
      throw error;
    }
  }
}

// Also checks the admin may edit that kind (Tour packages or Destinations access)
function toKind(kind: string, request: AdminRequest): Kind {
  if (kind === 'packages') {
    checkAccess(request.worker, 'packages');
    return 'package';
  }
  if (kind === 'destinations') {
    checkAccess(request.worker, 'destinations');
    return 'destination';
  }
  throw new BadRequestException('Use "packages" or "destinations"');
}
