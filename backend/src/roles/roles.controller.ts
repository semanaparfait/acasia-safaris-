import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../common/admin.guard';
import { RoleDto } from './dto/role.dto';
import { RolesService } from './roles.service';

// Routes under /api/roles. Admin only: the guard is on the whole controller.
@Controller('roles')
@UseGuards(AdminGuard)
export class RolesController {
  constructor(private rolesService: RolesService) {}

  // GET /api/roles   -> [{ id, name, description, workerCount }]
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  // POST /api/roles   body: { "name": "Chef", "description": "..." }
  @Post()
  create(@Body() dto: RoleDto) {
    return this.rolesService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: RoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.remove(id);
  }
}
