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
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from 'src/auth.guard';
import { AuthUserId } from 'src/auth-user.decorator';
import { TenantId, TenantIdFrom } from 'src/tenants/tenant.decorator';
import { TenantService } from 'src/tenants/tenants.service';
import { UserService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
    @Inject(forwardRef(() => TenantService))
    private tenantService: TenantService,
    private readonly userService: UserService,
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

    return this.authService.createToken({
      userId: user.id,
      email: user.email,
      tenantId,
    });
  }

  @Mutation(() => RegisteredUser)
  async register(
    @Args('email') email: string,
    @Args('password') password: string,
    @TenantId(TenantIdFrom.headers) tenantId: number,
  ): Promise<RegisteredUser> {
    await this.tenantService.fetchUniqueById(tenantId);

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    try {
      const user = await this.prismaService.user.create({
        data: { email, password: hash, tenantId },
        select: { id: true, email: true },
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
}
