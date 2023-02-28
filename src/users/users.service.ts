import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async fetchUnique(id: number) {
    const foundPlayer = await this.prismaService.user.findUnique({
      where: { id },
      include: { tenant: true },
    });

    if (!foundPlayer) {
      throw new NotFoundException(`User with ID: ${id} not found`);
    }

    return foundPlayer;
  }
}
