import { AppConfigService } from './../shared/services/app-config.service';
import { Injectable } from '@nestjs/common';
import { InjectAwsService } from 'nest-aws-sdk';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import extractFileExtension from 'src/helpers/extractFileExtension';

@Injectable()
export class S3ManagerService {
  private bucket: string;

  constructor(
    @InjectAwsService(S3) private readonly s3: S3,
    private readonly configService: AppConfigService,
  ) {
    this.bucket = configService.awsConfig.bucketName;
  }

  async listBucketContents(bucket: string) {
    const response = await this.s3.listObjectsV2({ Bucket: bucket }).promise();
    return response.Contents.map((c) => c.Key);
  }

  async putObjectFromFile(file: Express.Multer.File, tenantSlug: string) {
    const fileExtension = extractFileExtension(file.mimetype);
    const fileName = `${uuid()}.${fileExtension}`;
    const fileKey = `${tenantSlug}/${fileName}`;

    const result = await this.s3
      .putObject({
        Bucket: this.bucket,
        Key: fileKey,
        ACL: 'public-read',
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      .promise();

    if (result.$response.error) return { uploadedFileName: null };

    return { uploadedFileName: fileName };
  }

  async putObjectFromBuffer(buffer: Buffer, tenantSlug: string) {
    const fileName = `${uuid()}.webp`;
    const fileKey = `${tenantSlug}/${fileName}`;

    const result = await this.s3
      .putObject({
        Bucket: this.bucket,
        Key: fileKey,
        ACL: 'public-read',
        Body: buffer,
        ContentType: 'image/webp',
      })
      .promise();

    if (result.$response.error) return { uploadedFileName: null };

    return { uploadedFileName: fileName };
  }
}
