import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Args, Context, Mutation, Resolver, Query } from '@nestjs/graphql';
import { PrismaService } from '../prisma/prisma.service';
import { RegisteredUser, User } from './models/users.model';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from 'src/auth.guard';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
  ) {}

  @Mutation(() => String)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException();
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException();
    }

    return this.authService.createToken(user);
  }
  @UseGuards(AuthGuard)
  @Mutation(() => RegisteredUser)
  async register(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<RegisteredUser> {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    try {
      const user = await this.prismaService.user.create({
        data: { email, password: hash },
        select: { id: true, email: true },
      });

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new HttpException('Entity Already Exist', HttpStatus.CONFLICT);
      }
    }
  }

  @Query(() => User)
  me(@Context('user') user: User): User {
    return user;
  }
}
