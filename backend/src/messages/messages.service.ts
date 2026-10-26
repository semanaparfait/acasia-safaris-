import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto, UpdateMessageDto } from './dto/message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.message.findMany({ orderBy: { receivedAt: 'desc' } });
  }

  async findOne(id: number) {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) throw new NotFoundException(`Message ${id} not found`);
    return message;
  }

  create(dto: CreateMessageDto) {
    return this.prisma.message.create({ data: dto });
  }

  async update(id: number, dto: UpdateMessageDto) {
    await this.findOne(id);
    return this.prisma.message.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.message.delete({ where: { id } });
    return { deleted: true };
  }
}
