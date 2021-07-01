import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../prisma/prisma.module';
import { ColorsResolver } from './colors.resolver';

describe('ColorsResolver', () => {
  let resolver: ColorsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [ColorsResolver],
    }).compile();

    resolver = module.get<ColorsResolver>(ColorsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
