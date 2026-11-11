import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Audit } from '../audit/audit.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard, type AdminRequest } from '../common/admin.guard';
import { WorkerDto } from './dto/worker.dto';
import { WorkersService } from './workers.service';

// Routes under /api/workers. Admin only: the guard is on the whole controller.
// The logged-in admin (request.worker) is passed to the service for the admin rules.
@ApiTags('Workers')
@Controller('workers')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class WorkersController {
  constructor(private workersService: WorkersService) {}

  @Get()
  findAll() {
    return this.workersService.findAll();
  }

  // ParseUUIDPipe checks the id in the URL is a UUID (and returns 400 for "abc")
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.workersService.findOne(id);
  }

  @Post()
  @Audit('Added a worker', 'Worker')
  create(@Body() dto: WorkerDto, @Req() request: AdminRequest) {
    return this.workersService.create(dto, request.worker);
  }

  @Put(':id')
  @Audit('Edited a worker (role, access or details)', 'Worker')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: WorkerDto,
    @Req() request: AdminRequest,
  ) {
    return this.workersService.update(id, dto, request.worker);
  }

  @Delete(':id')
  @Audit('Deleted a worker', 'Worker')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() request: AdminRequest) {
    return this.workersService.remove(id, request.worker);
  }
}
