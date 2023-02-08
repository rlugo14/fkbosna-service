import { AppConfigService } from './../shared/services/app-config.service';
import { Injectable } from '@nestjs/common';
import { InjectAwsService } from 'nest-aws-sdk';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import extractFileExtension from 'src/helpers/extractFileExtension';

@Injectable()
export class S3ManagerService {
  constructor(
    @InjectAwsService(S3) private readonly s3: S3,
    private readonly configService: AppConfigService,
  ) {}

  async listBucketContents(bucket: string) {
    const response = await this.s3.listObjectsV2({ Bucket: bucket }).promise();
    return response.Contents.map((c) => c.Key);
  }

  async putObject(file: Express.Multer.File) {
    const bucket = this.configService.awsConfig.bucketName;
    const folderName = this.configService.awsConfig.bucketFolderName;
    const fileExtension = extractFileExtension(file.mimetype);
    const fileName = `${uuid()}.${fileExtension}`;
    const fileKey = `${folderName}/${fileName}`;

    const result = await this.s3
      .putObject({
        Bucket: bucket,
        Key: fileKey,
        ACL: 'public-read',
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      .promise();

    if (result.$response.error) return { uploadedFileName: null };

    return { uploadedFileName: fileName };
  }
}
