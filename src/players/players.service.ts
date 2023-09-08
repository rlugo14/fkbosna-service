import { AppConfigService } from 'src/shared/services/app-config.service';
import { HttpService } from '@nestjs/axios';
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/users/users.service';
import { FetchFupaSquadResponse, FupaPlayer } from './interfaces/fupa';
import { map, from, mergeMap, forkJoin, toArray, mergeAll, retry } from 'rxjs';
import { PlayerImageService } from 'src/player-image/player-image.service';
import { TenantService } from 'src/tenants/tenants.service';
import { Tenant } from 'src/tenants/models/tenant.model';

@Injectable()
export class PlayerService {
  private tenant: Tenant;
  private readonly logger = new Logger(PlayerService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly httpService: HttpService,
    private readonly playerImageService: PlayerImageService,
    private readonly tenantService: TenantService,
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
    this.tenant = await this.tenantService.fetchUniqueById(tenantId);
    this.logger.log(
      `Tenant: ${this.tenant.name} imported players from FuPa using ${tenantFupaSlug}`,
    );
    await this.prismaService.player.deleteMany({ where: { tenantId } });
    const squadUrl = `https://api.fupa.net/v1/teams/${tenantFupaSlug}/squad`;
    return this.httpService.get<FetchFupaSquadResponse>(squadUrl).pipe(
      map((response) => response.data),
      map((squadResponse) => squadResponse.players),
      mergeMap(async (fupaPlayers) => {
        await this.prismaService.player.createMany({
          data: fupaPlayers.map((player) => ({
            firstname: player.firstName,
            lastname: player.lastName,
            fupaSlug: player.slug,
            tenantId: this.tenant.id,
          })),
        });

        return from(fupaPlayers);
      }),
      mergeAll(),
      toArray(),
      mergeMap(this.fupaPlayersToResponsePlayerTuple),
      retry(2),
      mergeAll(),
      map(this.responsePlayerTupleToUpdatedPlayer),
      mergeAll(),
      toArray(),
    );
  }

  fupaPlayersToResponsePlayerTuple = (fupaPlayers: FupaPlayer[]) =>
    fupaPlayers.map((player) =>
      forkJoin([
        this.httpService.get(`${player.image.path}1920xauto.webp`, {
          responseType: 'arraybuffer',
        }),
        from(
          this.prismaService.player.findFirst({
            where: {
              fupaSlug: player.slug,
              tenantId: this.tenant.id,
              deletedAt: null,
            },
          }),
        ),
      ]),
    );

  responsePlayerTupleToUpdatedPlayer = async ([response, player]) => {
    const imageBuffer = Buffer.from(response.data);
    return this.playerImageService.createFromBuffer(
      imageBuffer,
      player.id,
      this.tenant.slug,
    );
  };

  async fetchAllPlayersFromTenant(tenantId: number) {
    return this.prismaService.player.findMany({
      where: { tenantId, deletedAt: null },
    });
  }
}
