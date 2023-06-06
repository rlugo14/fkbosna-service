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
    const invoiceFolderName = this.getString('INVOICE_FOLDER_NAME');

    return {
      keyId,
      secretKey,
      region,
      bucketName,
      invoiceFolderName,
      bucketBaseUrl: `https://${bucketName}.s3.${region}.amazonaws.com`,
    };
  }

  get jwtConfig() {
    const jwtSecret = this.getString('JWT_SECRET');

    return { jwtSecret };
  }

  get appConfig() {
    return {
      nodeEnv: this.getEnvironment(),
      isDev: this.isDev(),
      isProd: this.isProd(),
    };
  }

  get emailConfig(): {
    user: string;
    fromName: string;
    password: string;
    host: string;
    port: number;
    from: string;
    secure: boolean;
  } {
    return {
      user: this.getString('EMAIL_USER'),
      host: this.getString('EMAIL_HOST'),
      port: this.getNumber('EMAIL_PORT'),
      password: this.getString('EMAIL_PASSWORD'),
      from: this.getString('EMAIL_FROM'),
      fromName: this.getString('EMAIL_FROM_NAME'),
      secure: this.getBoolean('EMAIL_SECURE'),
    };
  }

  get slackConfig(): {
    token: string;
    channelId: string;
  } {
    return {
      token: this.getString('SLACK_TOKEN'),
      channelId: this.getString('SLACK_CHANNEL_ID'),
    };
  }

  get webAppConfig(): {
    protocol: string;
    host: string;
  } {
    return {
      protocol: this.getString('WEB_APP_PROTOCOL'),
      host: this.getString('WEB_APP_HOST'),
    };
  }

  private isDev(): boolean {
    return this.getEnvironment() === 'DEV';
  }

  private isProd(): boolean {
    return this.getEnvironment() === 'PROD';
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

  private getNumber(key: string): number {
    const value = this.get(key);

    try {
      return Number(value);
    } catch {
      throw new Error(key + ' environment variable is not a number');
    }
  }

  private getBoolean(key: string): boolean {
    const value = this.get(key);

    try {
      return Boolean(JSON.parse(value));
    } catch {
      throw new Error(key + ' env var is not a boolean');
    }
  }

  private get(key: string): string {
    const value = this.configService.get<string>(key);

    if (isNil(value)) {
      throw new Error(key + ' environment variable does not set'); // probably we should call process.exit() too to avoid locking the service
    }

    return value;
  }
}
