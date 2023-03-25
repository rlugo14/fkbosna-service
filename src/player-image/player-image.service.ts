import { BadRequestException, Injectable } from '@nestjs/common';
import { Color, Player } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3ManagerService } from 'src/s3-manager/s3-manager.service';

@Injectable()
export class PlayerImageService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3: S3ManagerService,
  ) {}

  async createFromFile(
    file: Express.Multer.File,
    playerId: number,
    tenantSlug: string,
  ): Promise<Player & { color: Color }> {
    const putObjectResponse = await this.s3.putObjectFromFile(file, tenantSlug);

    const uploadedFileName = putObjectResponse.uploadedFileName;

    if (!uploadedFileName) throw new BadRequestException();

    return this.prismaService.player.update({
      data: { imageName: uploadedFileName },
      where: { id: playerId },
      include: { color: true },
    });
  }

  async createFromBuffer(
    buffer: Buffer,
    playerId: number,
    tenantSlug: string,
  ): Promise<Player & { color: Color }> {
    const putObjectResponse = await this.s3.putObjectFromBuffer(
      buffer,
      tenantSlug,
    );

    const uploadedFileName = putObjectResponse.uploadedFileName;

    if (!uploadedFileName)
      throw new BadRequestException('Buffer not uploaded!');

    return this.prismaService.player.update({
      data: { imageName: uploadedFileName },
      where: { id: playerId },
      include: { color: true },
    });
  }
}
