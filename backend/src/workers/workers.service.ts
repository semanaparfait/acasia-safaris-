import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { toE164 } from '../common/phone';
import type { Worker } from '@prisma/client';
import { hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RolesService } from '../roles/roles.service';
import { StorageService } from '../storage/storage.service';
import { SOCIAL_NETWORKS, WorkerDto } from './dto/worker.dto';

// The admin who is making the request (from AdminGuard)
type Actor = Omit<Worker, 'passwordHash' | 'tokenVersion'>;

// The form sends "2026-10-31", but the database needs a full date
const toDate = (date?: string) => (date ? new Date(date) : undefined);

export const COMPANY_DOMAIN = 'acaciasafaris.com';

// "Jean Bosco Habimana" -> "jean", "Éric" -> "eric"
export const firstNameOf = (name: string) =>
  (name.trim().split(/\s+/)[0] ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // accents
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') || 'worker';

// True when the email is already the company email for this first name ("jean@", "jean2@", ...)
const matchesFirstName = (email: string, name: string) => {
  const [local = '', domain] = email.split('@');
  const first = firstNameOf(name);
  return (
    domain === COMPANY_DOMAIN &&
    local.startsWith(first) &&
    /^\d*$/.test(local.slice(first.length))
  );
};

// The About us fields, cleaned: empty text becomes null and only filled-in social links are kept.
// A worker shown on the website needs a company role ("CEO & Founder", ...).
function websiteFields(dto: WorkerDto) {
  const companyRole = dto.companyRole?.trim() || null;
  if (dto.showOnWebsite && !companyRole) {
    throw new BadRequestException(
      'Add a company role to show this worker on the About us page',
    );
  }
  const socials: Record<string, string> = {};
  for (const network of SOCIAL_NETWORKS) {
    const link = dto.socials?.[network]?.trim();
    if (link) socials[network] = link;
  }
  return {
    showOnWebsite: dto.showOnWebsite ?? false,
    companyRole,
    bio: dto.bio?.trim() || null,
    socials,
  };
}

// Rules for admins:
//  - The main admin (isOwner) cannot be deleted and always keeps admin access.
//  - Only the main admin can give or remove admin access and set admins' passwords.
//  - Only the main admin can edit the main admin's account.
//  - An admin must have a password.
@Injectable()
export class WorkersService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private roles: RolesService,
  ) {}

  // Each worker gets "hasPassword" (true/false) instead of the password hash
  async findAll() {
    const workers = await this.prisma.worker.findMany({
      orderBy: [{ isOwner: 'desc' }, { name: 'asc' }], // main admin first
      omit: { passwordHash: false },
    });
    return workers.map(({ passwordHash, ...worker }) => ({
      ...worker,
      hasPassword: Boolean(passwordHash),
    }));
  }

  // About us page (public): only what visitors may see, founders and longest-serving first
  team() {
    return this.prisma.worker.findMany({
      where: { showOnWebsite: true, status: 'Active' },
      orderBy: [{ joined: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        companyRole: true,
        photo: true,
        bio: true,
        personalEmail: true,
        phone: true,
        languages: true,
        socials: true,
      },
    });
  }

  async findOne(id: string) {
    const worker = await this.prisma.worker.findUnique({
      where: { id },
      omit: { passwordHash: false },
    });
    if (!worker) throw new NotFoundException(`Worker ${id} not found`);
    const { passwordHash, ...safe } = worker;
    return { ...safe, hasPassword: Boolean(passwordHash) };
  }

  async create(dto: WorkerDto, actor: Actor) {
    const email = await this.companyEmail(dto.name);
    await this.roles.checkExists(dto.role);

    if (dto.isAdmin) {
      this.onlyMainAdmin(actor);
      if (!dto.password) {
        throw new BadRequestException('An admin needs a password to log in');
      }
    }

    const { password, ...data } = dto;
    const worker = await this.prisma.worker.create({
      data: {
        ...data,
        ...websiteFields(dto),
        email,
        personalEmail: dto.personalEmail.toLowerCase().trim(),
        phone: toE164(dto.phone) ?? dto.phone,
        joined: toDate(dto.joined),
        passwordHash: password ? await hash(password, 10) : null,
      },
    });
    return { ...worker, hasPassword: Boolean(password) };
  }

  async update(id: string, dto: WorkerDto, actor: Actor) {
    const current = await this.findOne(id);
    await this.roles.checkExists(dto.role);

    // A new first name gives a new company email (and login). Older emails that do not
    // follow the rule yet are changed too. The main admin's login comes from .env, so it stays.
    const email =
      current.isOwner || matchesFirstName(current.email, dto.name)
        ? current.email
        : await this.companyEmail(dto.name, id);

    if (current.isOwner) {
      // Only the main admin edits their own account, and they always stay an active admin
      if (actor.id !== current.id) {
        throw new ForbiddenException(
          'Only the main admin can edit this account',
        );
      }
      dto.isAdmin = true;
      dto.status = 'Active';
    } else {
      const isAdmin = dto.isAdmin ?? current.isAdmin;
      const adminAccessChanges = isAdmin !== current.isAdmin;
      const adminPasswordChanges = Boolean(dto.password) && isAdmin;
      if (adminAccessChanges || adminPasswordChanges) this.onlyMainAdmin(actor);
    }

    const isAdmin = dto.isAdmin ?? current.isAdmin;
    if (isAdmin && !dto.password && !current.hasPassword) {
      throw new BadRequestException('An admin needs a password to log in');
    }

    const { password, ...data } = dto;
    const worker = await this.prisma.worker.update({
      where: { id },
      data: {
        ...data,
        ...websiteFields(dto),
        email,
        personalEmail: dto.personalEmail.toLowerCase().trim(),
        phone: toE164(dto.phone) ?? dto.phone,
        joined: toDate(dto.joined),
        // Only change the password when a new one is sent
        ...(password ? { passwordHash: await hash(password, 10) } : {}),
      },
    });
    return { ...worker, hasPassword: Boolean(password) || current.hasPassword };
  }

  async remove(id: string, actor: Actor) {
    const worker = await this.findOne(id);
    if (worker.isOwner) {
      throw new ForbiddenException('The main admin cannot be deleted');
    }
    if (worker.isAdmin) this.onlyMainAdmin(actor);

    await this.prisma.worker.delete({ where: { id } });
    await this.storage.deleteByUrl(worker.photo);
    return { deleted: true };
  }

  // first name + @acaciasafaris.com. Two workers cannot share an email (it is @unique),
  // so a second "Jean" gets jean2@, then jean3@ ...
  private async companyEmail(name: string, exceptId?: string) {
    const first = firstNameOf(name);
    for (let n = 1; ; n++) {
      const email = `${first}${n === 1 ? '' : n}@${COMPANY_DOMAIN}`;
      const existing = await this.prisma.worker.findUnique({
        where: { email },
      });
      if (!existing || existing.id === exceptId) return email;
    }
  }

  private onlyMainAdmin(actor: Actor) {
    if (!actor.isOwner) {
      throw new ForbiddenException(
        'Only the main admin can give or change admin access',
      );
    }
  }
}
