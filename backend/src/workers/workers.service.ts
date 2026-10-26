import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkerDto } from './dto/worker.dto';

@Injectable()
export class WorkersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.worker.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: number) {
    const worker = await this.prisma.worker.findUnique({ where: { id } });
    if (!worker) throw new NotFoundException(`Worker ${id} not found`);
    return worker;
  }

  async create(dto: WorkerDto) {
    await this.checkEmailIsFree(dto.email);
    return this.prisma.worker.create({ data: dto });
  }

  async update(id: number, dto: WorkerDto) {
    await this.findOne(id);
    await this.checkEmailIsFree(dto.email, id);
    return this.prisma.worker.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.worker.delete({ where: { id } });
    return { deleted: true };
  }

  // Two workers cannot share an email (email is @unique in the schema)
  private async checkEmailIsFree(email: string, exceptId?: number) {
    const existing = await this.prisma.worker.findUnique({ where: { email } });
    if (existing && existing.id !== exceptId) {
      throw new ConflictException(
        `A worker with email ${email} already exists`,
      );
    }
  }
}
