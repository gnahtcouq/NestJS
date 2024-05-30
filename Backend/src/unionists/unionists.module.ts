import { Module } from '@nestjs/common';
import { UnionistsService } from './unionists.service';
import { UnionistsController } from './unionists.controller';

@Module({
  controllers: [UnionistsController],
  providers: [UnionistsService]
})
export class UnionistsModule {}
