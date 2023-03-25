import { AppConfigService } from 'src/shared/services/app-config.service';
import { HttpService } from '@nestjs/axios';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/users/users.service';
import { FetchFupaSquadResponse } from './interfaces/fupa';
import { map, firstValueFrom, from, zip, count } from 'rxjs';
import { PlayerImageService } from 'src/player-image/player-image.service';
import { TenantService } from 'src/tenants/tenants.service';

@Injectable()
export class PlayerService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly httpService: HttpService,
    private readonly playerImageService: PlayerImageService,
    private readonly tenantService: TenantService,
    private readonly appConfigService: AppConfigService,
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

  async importFromFupa(tenantFupaSlug: string, tenantId: number) {
    const tenant = await this.tenantService.fetchUniqueById(tenantId);
    const squadUrl = `https://api.fupa.net/v1/teams/${tenantFupaSlug}/squad`;
    const squadObservable = this.httpService
      .get<FetchFupaSquadResponse>(squadUrl)
      .pipe(map((response) => response.data));

    const squadResponse = await firstValueFrom(squadObservable);
    const fupaPlayers = squadResponse.players;
    await this.prismaService.player.createMany({
      data: fupaPlayers.map((player) => ({
        firstname: player.firstName,
        lastname: player.lastName,
        fupaSlug: player.slug,
        tenantId: tenant.id,
      })),
    });
    const players = await this.prismaService.player.findMany({
      where: { tenantId: tenant.id },
    });

    const playersObservable = from(players);

    const imageDataObservable = from(fupaPlayers).pipe(
      map(async (player) => {
        const imageObservable = this.httpService.get(
          `${player.image.path}1920xauto.webp`,
          {
            responseType: 'arraybuffer',
          },
        );
        const imageResponse = await firstValueFrom(imageObservable);

        return { player, imageResponse };
      }),
    );

    return zip(playersObservable, imageDataObservable).pipe(
      map(async ([player, imageData]) => {
        const imageBuffer = Buffer.from((await imageData).imageResponse.data);
        await this.playerImageService.createFromBuffer(
          imageBuffer,
          player.id,
          this.appConfigService.appConfig.isDev ? 'development' : tenant.slug,
        );
      }),
      count(),
    );
  }
}
