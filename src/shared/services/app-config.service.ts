import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isNil } from '@nestjs/common/utils/shared.utils';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get awsConfig() {
    const keyId = this.getString('AWS_ACCESS_KEY_ID');
    const secretKey = this.getString('AWS_SECRET_ACCESS_KEY');
    const region = this.getString('AWS_REGION');
    const bucketName = this.getString('BUCKET_NAME');
    const bucketFolderName = this.getString('BUCKET_FOLDER_NAME');

    return {
      keyId,
      secretKey,
      region,
      bucketName,
      bucketFolderName,
      bucketBaseUrl: `https://${bucketName}.s3.${region}.amazonaws.com`,
    };
  }

  private getEnvironment(): 'DEV' | 'PROD' {
    const env = this.get('NODE_ENV');

    if (env === 'development') {
      return 'DEV';
    }

    return 'PROD';
  }

  private getString(key: string): string {
    const value = this.get(key);

    return value.replace(/\\n/g, '\n');
  }

  private get(key: string): string {
    const value = this.configService.get<string>(key);

    if (isNil(value)) {
      throw new Error(key + ' environment variable does not set'); // probably we should call process.exit() too to avoid locking the service
    }

    return value;
  }
}
