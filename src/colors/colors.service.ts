import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/users/users.service';

@Injectable()
export class ColorService {
  private readonly logger = new Logger(ColorService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async fetchUnique(id: number) {
    const foundColor = await this.prismaService.color.findUnique({
      where: { id },
      include: { tenant: true },
    });

    if (!foundColor || foundColor.deletedAt) {
      this.logger.error(`Color with id: ${id}}`);
      throw new NotFoundException(`Color with ID: ${id} not found`);
    }

    return foundColor;
  }

  async verifyUserCanManageColor(userId: number, colorId: number) {
    const user = await this.userService.fetchUniqueById(userId);
    const targetColor = await this.fetchUnique(colorId);

    if (user.tenantId !== targetColor.tenantId) {
      this.logger.error(
        `User: ${JSON.stringify(user)} cannot manage color: ${JSON.stringify(
          targetColor,
        )}`,
      );
      throw new ForbiddenException();
    }
  }

  async createDefaultColors(tenantId: number) {
    return this.prismaService.color.createMany({
      data: [
        { hexCode: '#FAE225', name: 'gelb', tenantId },
        { hexCode: '#000000', name: 'schwarz', tenantId },
        { hexCode: '#FFFFFF', name: 'weiss', tenantId },
      ],
    });
  }
}
