import { AppConfigService } from 'src/shared/services/app-config.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    readonly configService: AppConfigService,
  ) {}

  async create(email: string, password: string, tenantId: number) {
    const hash = await this.generatePasswordHash(password);
    return this.prismaService.user.create({
      data: { email, password: hash, tenantId },
      select: { id: true, email: true, tenant: true },
    });
  }

  async generatePasswordHash(password: string) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    return hash;
  }

  async fetchUniqueById(id: number) {
    const foundPlayer = await this.prismaService.user.findUnique({
      where: { id },
      include: { tenant: true },
    });

    if (!foundPlayer) {
      throw new NotFoundException(`User with ID: ${id} not found`);
    }

    return foundPlayer;
  }

  async fetchUniqueByEmail(email: string) {
    const foundPlayer = await this.prismaService.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (!foundPlayer) {
      throw new NotFoundException(`User with Email: ${email} not found`);
    }

    return foundPlayer;
  }

  async verifyEmailIsAvailable(email: string) {
    const foundTenant = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (foundTenant) {
      throw new BadRequestException(`Email: '${email}' is not available`);
    }
  }

  async updatePassword(userId: number, newPassword: string) {
    const foundUser = await this.fetchUniqueById(userId);
    await this.prismaService.user.update({
      where: { id: foundUser.id },
      data: { password: newPassword },
    });
  }

  buildTenantLoginUrl(tenantSlug: string) {
    const { protocol, host } = this.configService.webAppConfig;
    return `${protocol}${tenantSlug}.${host}/login`;
  }

  async markEmailAsVerified(email: string) {
    const foundUser = await this.fetchUniqueByEmail(email);
    const dateNow = new Date(Date.now()).toISOString();
    await this.prismaService.user.update({
      where: { id: foundUser.id },
      data: { emailVerifiedAt: dateNow },
    });
  }
}
