import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3ManagerService } from 'src/s3-manager/s3-manager.service';

@Injectable()
export class PlayerImageService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3: S3ManagerService,
  ) {}

  async create(
    file: Express.Multer.File,
    playerId: number,
    tenantSlug: string,
  ): Promise<any> {
    const putObjectResponse = await this.s3.putObject(file, tenantSlug);

    const uploadedFileName = putObjectResponse.uploadedFileName;

    if (!uploadedFileName) throw new BadRequestException();

    return this.prismaService.player.update({
      data: { imageName: uploadedFileName },
      where: { id: playerId },
      include: { color: true },
    });
  }
}
