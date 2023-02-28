import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/users/users.service';

@Injectable()
export class ColorService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async fetchUnique(id: number) {
    const foundPlayer = await this.prismaService.color.findUnique({
      where: { id },
      include: { tenant: true },
    });

    if (!foundPlayer) {
      throw new NotFoundException(`Player with ID: ${id} not found`);
    }

    return foundPlayer;
  }

  async verifyUserCanManageColor(userId: number, colorId: number) {
    const user = await this.userService.fetchUnique(userId);
    const targetColor = await this.fetchUnique(colorId);

    if (user.tenantId !== targetColor.tenantId) {
      throw new ForbiddenException();
    }
  }
}
