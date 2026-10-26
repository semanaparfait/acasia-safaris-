import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoleDto } from './dto/role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  // Each role comes with how many workers have it
  async findAll() {
    const [roles, counts] = await Promise.all([
      this.prisma.role.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.worker.groupBy({ by: ['role'], _count: true }),
    ]);
    return roles.map((role) => ({
      ...role,
      workerCount: counts.find((c) => c.role === role.name)?._count ?? 0,
    }));
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException(`Role ${id} not found`);
    return role;
  }

  async create(dto: RoleDto) {
    const name = dto.name.trim();
    await this.checkNameIsFree(name);
    return this.prisma.role.create({
      data: { name, description: dto.description?.trim() ?? '' },
    });
  }

  async update(id: number, dto: RoleDto) {
    const current = await this.findOne(id);
    const name = dto.name.trim();
    await this.checkNameIsFree(name, id);

    // Rename the role and its workers together, so no worker ends up with an old name
    const [role] = await this.prisma.$transaction([
      this.prisma.role.update({
        where: { id },
        data: { name, description: dto.description?.trim() ?? '' },
      }),
      this.prisma.worker.updateMany({
        where: { role: current.name },
        data: { role: name },
      }),
    ]);
    return role;
  }

  async remove(id: number) {
    const role = await this.findOne(id);
    const workers = await this.prisma.worker.count({
      where: { role: role.name },
    });
    if (workers > 0) {
      throw new BadRequestException(
        `${workers} worker(s) have the role "${role.name}". Give them another role first.`,
      );
    }
    await this.prisma.role.delete({ where: { id } });
    return { deleted: true };
  }

  // Used by WorkersService: a worker's role must be one of the roles
  async checkExists(name: string) {
    const role = await this.prisma.role.findUnique({ where: { name } });
    if (!role) {
      throw new BadRequestException(
        `Unknown role "${name}". Add it in Admin > Roles first.`,
      );
    }
  }

  private async checkNameIsFree(name: string, exceptId?: number) {
    const existing = await this.prisma.role.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    if (existing && existing.id !== exceptId) {
      throw new ConflictException(
        `A role called "${existing.name}" already exists`,
      );
    }
  }
}
