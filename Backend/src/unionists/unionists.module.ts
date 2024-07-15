import { Module } from '@nestjs/common';
import { UnionistsService } from './unionists.service';
import { UnionistsController } from './unionists.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Unionist,
  UnionistSchema,
} from 'src/unionists/schemas/unionist.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Unionist.name, schema: UnionistSchema },
    ]),
  ],
  controllers: [UnionistsController],
  providers: [UnionistsService],
  exports: [UnionistsService],
})
export class UnionistsModule {}
