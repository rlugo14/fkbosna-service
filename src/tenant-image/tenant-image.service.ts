import { Tenant } from 'src/tenants/models/tenant.model';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3ManagerService } from 'src/s3-manager/s3-manager.service';
import { HttpService } from '@nestjs/axios';
import { map, mergeAll, mergeMap } from 'rxjs';

@Injectable()
export class TenantImageService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3: S3ManagerService,
    private readonly httpService: HttpService,
  ) {}

  async createFromFile(
    file: Express.Multer.File,
    tenantId: number,
    tenantSlug: string,
  ): Promise<Tenant> {
    const putObjectResponse = await this.s3.putObjectFromFile(file, tenantSlug);

    const uploadedFileName = putObjectResponse.uploadedFileName;

    if (!uploadedFileName) throw new BadRequestException();

    return this.prismaService.tenant.update({
      data: { imageName: uploadedFileName },
      where: { id: tenantId },
    });
  }

  async createFromBuffer(
    buffer: Buffer,
    tenantId: number,
    tenantSlug: string,
  ): Promise<Tenant> {
    const putObjectResponse = await this.s3.putObjectFromBuffer(
      buffer,
      tenantSlug,
    );

    const uploadedFileName = putObjectResponse.uploadedFileName;

    if (!uploadedFileName)
      throw new BadRequestException('Buffer not uploaded!');

    return this.prismaService.tenant.update({
      data: { imageName: uploadedFileName },
      where: { id: tenantId },
    });
  }

  async downloadAndCreate(
    imageUrl: string,
    tenantId: number,
    tenantSlug: string,
  ) {
    const imageObservable = this.httpService.get(`${imageUrl}800x800.webp`, {
      responseType: 'arraybuffer',
    });

    return imageObservable.pipe(
      map((response) => {
        const imageBuffer = Buffer.from(response.data);
        return this.createFromBuffer(imageBuffer, tenantId, tenantSlug);
      }),
      mergeAll(),
    );
  }
}
