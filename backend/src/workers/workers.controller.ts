import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard, type AdminRequest } from '../common/admin.guard';
import { WorkerDto } from './dto/worker.dto';
import { WorkersService } from './workers.service';

// Routes under /api/workers. Admin only: the guard is on the whole controller.
// The logged-in admin (request.worker) is passed to the service for the admin rules.
@Controller('workers')
@UseGuards(AdminGuard)
export class WorkersController {
  constructor(private workersService: WorkersService) {}

  @Get()
  findAll() {
    return this.workersService.findAll();
  }

  // ParseIntPipe turns "5" from the URL into the number 5 (and returns 400 for "abc")
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workersService.findOne(id);
  }

  @Post()
  create(@Body() dto: WorkerDto, @Req() request: AdminRequest) {
    return this.workersService.create(dto, request.worker);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: WorkerDto,
    @Req() request: AdminRequest,
  ) {
    return this.workersService.update(id, dto, request.worker);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() request: AdminRequest) {
    return this.workersService.remove(id, request.worker);
  }
}
