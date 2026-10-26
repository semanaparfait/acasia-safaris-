import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../common/admin.guard';
import { WorkerDto } from './dto/worker.dto';
import { WorkersService } from './workers.service';

// Routes under /api/workers. Admin only: the guard is on the whole controller.
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
  create(@Body() dto: WorkerDto) {
    return this.workersService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: WorkerDto) {
    return this.workersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.workersService.remove(id);
  }
}
