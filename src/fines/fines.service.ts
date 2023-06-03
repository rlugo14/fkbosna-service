import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import getMonthLimits from 'src/helpers/getMonthLimits';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/users/users.service';
import {
  CreateFineInput,
  CreatePlayerFineInput,
} from './dto/create-fine.input';
import { Fine } from './models/fine.model';
import { PlayerService } from 'src/players/players.service';
import { UpsertTransactions } from './interfaces';

@Injectable()
export class FinesService {
  constructor(
    private readonly userService: UserService,
    private readonly playerService: PlayerService,
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

  async fetchPlayerFineByFineTypeInCurrentMonth(
    playerId: number,
    fineTypeId: number,
  ) {
    const currentDate = new Date(Date.now());
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const currentMonthLimits = getMonthLimits(currentMonth, currentYear);

    return this.prismaService.fine.findFirst({
      where: {
        typeId: fineTypeId,
        playerId,
        createdAt: {
          gte: currentMonthLimits.firstDay,
          lte: currentMonthLimits.lastDay,
        },
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

  async createUpdateOrCreateFinesTransactions(
    createFinesInput: CreateFineInput[],
    playerId: number,
    userId: number,
    tenantId: number,
  ): Promise<UpsertTransactions> {
    const transactionPromises: UpsertTransactions = {
      createManyData: [],
      updates: [],
    };

    for (const input of createFinesInput) {
      await this.playerService.verifyUserCanManagePlayer(userId, playerId);

      const fineType = await this.fetchUniqueFineType(input.typeId);
      const existingFineByType = await this.findExistingPlayerFineByType(
        playerId,
        fineType.id,
      );

      if (existingFineByType) {
        const newAmount = existingFineByType.amount + input.amount;

        const newTotal: number =
          existingFineByType.total + input.amount * fineType.cost;

        transactionPromises.updates.push(
          this.prismaService.fine.update({
            data: {
              amount: newAmount,
              total: newTotal,
            },
            where: { id: existingFineByType.id },
          }),
        );
      } else {
        transactionPromises.createManyData.push({
          playerId: playerId,
          amount: input.amount,
          typeId: input.typeId,
          tenantId,
          total: input.amount * fineType.cost,
          createdAt: new Date(Date.now()),
        });
      }
    }

    return transactionPromises;
  }

  async createUpdateOrCreatePlayersFineTransactions(
    createPlayersFineInput: CreatePlayerFineInput[],
    userId: number,
    tenantId: number,
  ): Promise<UpsertTransactions> {
    const transactionPromises: UpsertTransactions = {
      createManyData: [],
      updates: [],
    };

    for (const input of createPlayersFineInput) {
      await this.playerService.verifyUserCanManagePlayer(
        userId,
        input.playerId,
      );

      const fineType = await this.fetchUniqueFineType(input.typeId);
      const existingFineByType = await this.findExistingPlayerFineByType(
        input.playerId,
        fineType.id,
      );

      if (existingFineByType) {
        let newAmount: number;
        if (existingFineByType.amount === input.amount)
          newAmount = existingFineByType.amount;
        else
          newAmount =
            existingFineByType.amount -
            (existingFineByType.amount - input.amount);

        const amountDiff = existingFineByType.amount - newAmount;
        let newTotal: number;
        if (newAmount === 0) newTotal = 0;
        else if (amountDiff === 0) newTotal = existingFineByType.total;
        else newTotal = existingFineByType.total - amountDiff * fineType.cost;

        transactionPromises.updates.push(
          this.prismaService.fine.update({
            data: {
              amount: newAmount,
              total: newTotal,
            },
            where: { id: existingFineByType.id },
          }),
        );
      } else {
        transactionPromises.createManyData.push({
          playerId: input.playerId,
          amount: input.amount,
          typeId: input.typeId,
          tenantId,
          total: input.amount * fineType.cost,
          createdAt: new Date(Date.now()),
        });
      }
    }

    return transactionPromises;
  }

  private calculateNewTotal(
    oldAmount: number,
    newAmount: number,
    oldTotal: number,
    fineCost: number,
  ) {
    if (oldAmount === newAmount) return oldTotal;
    if (newAmount === 0) return 0;
    if (oldAmount > newAmount) return oldTotal - newAmount * fineCost;
    if (oldAmount < newAmount) return oldTotal + newAmount * fineCost;
    return 0;
  }

  private calculateNewAmount(oldAmount: number, newAmount: number) {
    if (oldAmount === newAmount) return oldAmount;
    const diff = oldAmount - newAmount;
    return oldAmount - diff;
  }

  async findExistingPlayerFineByType(
    playerId: number,
    typeId: number,
  ): Promise<Fine> {
    const fineType = await this.fetchUniqueFineType(typeId);
    return this.fetchPlayerFineByFineTypeInCurrentMonth(playerId, fineType.id);
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
