import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/users/users.service';

@Injectable()
export class FinesService {
  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
  ) {}

  async fetchUniqueFineType(id: number) {
    const foundFineType = await this.prismaService.fineType.findUnique({
      where: { id },
    });

    if (!foundFineType) {
      throw new NotFoundException(`FineType with ID: ${id} not found`);
    }

    return foundFineType;
  }

  async fetchUniqueFine(id: number) {
    const foundFine = await this.prismaService.fine.findUnique({
      where: { id },
    });

    if (!foundFine) {
      throw new NotFoundException(`Fine with ID: ${id} not found`);
    }

    return foundFine;
  }

  async fetchFineByFineTypeInCurrentMonth(fineTypeId: number) {
    const currentDate = new Date(Date.now());
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthFirstDay = new Date(currentYear, currentMonth, 1);
    const monthLastDay = new Date(currentYear, currentMonth + 1, 0);

    return this.prismaService.fine.findFirst({
      where: {
        typeId: fineTypeId,
        createdAt: { gte: monthFirstDay, lte: monthLastDay },
      },
    });
  }

  async verifyUserCanManageFine(userId: number, fineTypeId: number) {
    const user = await this.userService.fetchUniqueById(userId);
    const targetFine = await this.fetchUniqueFine(fineTypeId);

    if (user.tenantId !== targetFine.tenantId) {
      throw new ForbiddenException();
    }
  }

  async verifyUserCanManageFineType(userId: number, fineTypeId: number) {
    const user = await this.userService.fetchUniqueById(userId);
    const targetFineType = await this.fetchUniqueFineType(fineTypeId);

    if (user.tenantId !== targetFineType.tenantId) {
      throw new ForbiddenException();
    }
  }

  async createDefaultFineTypes(tenantId: number) {
    return this.prismaService.fineType.createMany({
      data: [
        { name: 'Tunnel', cost: 1, tenantId, category: 'TRAINING' },
        { name: 'Doppel Runde', cost: 1, tenantId, category: 'TRAINING' },
        { name: 'Verspätet', cost: 5, tenantId, category: 'TRAINING' },
        { name: 'Verspätet', cost: 15, tenantId, category: 'GAME' },
        {
          name: 'Monatlicher Beitrag',
          cost: 10,
          tenantId,
          category: 'GENERAL',
        },
      ],
    });
  }
}
