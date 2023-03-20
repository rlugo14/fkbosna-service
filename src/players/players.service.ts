import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/users/users.service';

@Injectable()
export class PlayerService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async fetchUnique(id: number) {
    const foundPlayer = await this.prismaService.player.findUnique({
      where: { id },
      include: { tenant: true },
    });

    if (!foundPlayer || foundPlayer.deletedAt) {
      throw new NotFoundException(`Player with ID: ${id} not found`);
    }

    return foundPlayer;
  }

  async verifyUserCanManagePlayer(userId: number, playerId: number) {
    const user = await this.userService.fetchUniqueById(userId);
    const targetPlayer = await this.fetchUnique(playerId);

    if (user.tenantId !== targetPlayer.tenantId) {
      throw new ForbiddenException();
    }
  }
}
