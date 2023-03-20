import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

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
}
