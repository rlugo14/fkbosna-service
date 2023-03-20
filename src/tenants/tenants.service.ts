import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/users/users.service';

@Injectable()
export class TenantService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async fetchUniqueById(id: number) {
    const foundTenant = await this.prismaService.tenant.findUnique({
      where: { id },
    });

    if (!foundTenant) {
      throw new NotFoundException(`Tenant with ID: ${id} not found`);
    }

    return foundTenant;
  }

  async verifySlugIsAvailable(slug: string) {
    const foundTenant = await this.prismaService.tenant.findUnique({
      where: { slug },
    });

    if (foundTenant) {
      throw new BadRequestException(`Slug: '${slug}' is not available`);
    }
  }

  async verifyUserCanManageTenant(userId: number, tenantId: number) {
    const user = await this.userService.fetchUniqueById(userId);
    const targetTenant = await this.fetchUniqueById(tenantId);

    if (user.tenantId !== targetTenant.id) {
      throw new ForbiddenException();
    }
  }
}
