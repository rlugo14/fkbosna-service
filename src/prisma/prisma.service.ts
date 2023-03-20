import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    await this.activate();
  }
  async activate() {
    this.$use(async (params, next) => {
      const dateNow = new Date(Date.now()).toISOString();
      if (params.action == 'delete') {
        // Delete queries
        // Change action to an update
        params.action = 'update';
        params.args['data'] = { deletedAt: dateNow };
      }
      if (params.action == 'deleteMany') {
        // Delete many queries
        params.action = 'updateMany';
        if (params.args.data != undefined) {
          params.args.data['deleted'] = true;
        } else {
          params.args['data'] = { deletedAt: dateNow };
        }
      }
      return next(params);
    });
  }
}
