import { UserService } from './users.service';
import { Module, forwardRef } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { TenantsModule } from 'src/tenants/tenants.module';
import { JwtModule } from '@nestjs/jwt';
import { EmailConfirmationController } from './emailConfirmation.controller';
import { EmailConfirmationService } from './emailConfirmation.service';

@Module({
  imports: [JwtModule, forwardRef(() => TenantsModule)],
  controllers: [EmailConfirmationController],
  providers: [UsersResolver, UserService, EmailConfirmationService],
  exports: [UserService],
})
export class UserModule {}
