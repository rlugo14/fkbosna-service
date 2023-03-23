import {
  HttpException,
  HttpStatus,
  Inject,
  UnauthorizedException,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { PrismaService } from '../prisma/prisma.service';
import { RegisteredUser, User } from './models/users.model';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AuthGuard } from 'src/auth.guard';
import { AuthUserId } from 'src/auth-user.decorator';
import { TenantId, TenantIdFrom } from 'src/tenants/tenant.decorator';
import { TenantService } from 'src/tenants/tenants.service';
import { UserService } from './users.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from 'src/constants';
import { AppConfigService } from 'src/shared/services/app-config.service';
import { TokenService } from 'src/tokens/tokens.service';
import { Boolean } from 'aws-sdk/clients/batch';
import { Token } from 'src/token.decorator';
import * as randomatic from 'randomatic';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    @Inject(forwardRef(() => TenantService))
    private tenantService: TenantService,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: AppConfigService,
  ) {}

  @Mutation(() => String)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
    @TenantId(TenantIdFrom.headers) tenantId: number,
  ) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (!user || user.tenantId !== tenantId) {
      throw new UnauthorizedException();
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException();
    }

    await this.tokenService.deleteAll(user.id);
    return this.tokenService.createLoginToken({
      userId: user.id,
      email: user.email,
      tenantId,
      type: 'access',
    });
  }

  @Mutation(() => RegisteredUser)
  async register(
    @Args('email') email: string,
    @Args('password') password: string,
    @TenantId(TenantIdFrom.headers) tenantId: number,
  ): Promise<RegisteredUser> {
    const foundTenant = await this.tenantService.fetchUniqueById(tenantId);

    try {
      const user = await this.userService.create(email, password, tenantId);

      this.eventEmitter.emit(Events.sendMail, {
        to: email,
        subject: 'Wilkommen! | Matdienst.de',
        template: './welcome',
        context: {
          url: this.userService.buildTenantLoginUrl(foundTenant.slug),
        },
      });

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new HttpException('Entity Already Exist', HttpStatus.CONFLICT);
      }
    }
  }

  @UseGuards(AuthGuard)
  @Mutation(() => RegisteredUser)
  async createUser(
    @Args('email') email: string,
    @TenantId(TenantIdFrom.token) tenantId: number,
  ): Promise<RegisteredUser> {
    const foundTenant = await this.tenantService.fetchUniqueById(tenantId);

    const password = randomatic('*', 12);

    try {
      const user = await this.userService.create(email, password, tenantId);

      this.eventEmitter.emit(Events.sendMail, {
        to: email,
        subject: 'Wilkommen! | Matdienst.de',
        template: './create-user',
        context: {
          url: this.userService.buildTenantLoginUrl(foundTenant.slug),
          password,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new HttpException('Entity Already Exist', HttpStatus.CONFLICT);
      }
    }
  }

  @UseGuards(AuthGuard)
  @Query(() => Number)
  async me(@AuthUserId() userId: number): Promise<number> {
    const foundUser = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    return foundUser.id;
  }

  @Query(() => Boolean)
  async isUserEmailAvailable(@Args('email') email: string): Promise<boolean> {
    try {
      await this.userService.verifyEmailIsAvailable(email);
      return true;
    } catch (error) {
      return false;
    }
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  async changePassword(
    @Args('newPassword') newPassword: string,
    @AuthUserId() userId: number,
    @Token() token: string,
  ): Promise<boolean> {
    await this.tokenService.checkTokenValidity(token);
    await this.tokenService.deleteAll(userId);
    const hash = await this.userService.generatePasswordHash(newPassword);
    await this.userService.updatePassword(userId, hash);
    return true;
  }
}
