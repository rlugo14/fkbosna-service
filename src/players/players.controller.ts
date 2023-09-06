import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PlayerService } from './players.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { TenantId, TenantIdFrom } from 'src/decorators/tenant.decorator';
import { EmailConfirmedGuard } from 'src/guards/email-confirmed.guard';

@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @UseGuards(AuthGuard, EmailConfirmedGuard)
  @Get('fupa-import/:tenantFupaSlug')
  async importFromFupa(
    @Param('tenantFupaSlug') tenantFupaSlug: string,
    @TenantId(TenantIdFrom.token) tenantId: number,
  ) {
    return this.playerService.importFromFupa(tenantFupaSlug, tenantId);
  }
}
