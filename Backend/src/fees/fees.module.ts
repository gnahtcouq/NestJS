import { Module } from '@nestjs/common';
import { FeesService } from './fees.service';
import { FeesController } from './fees.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Fee, FeeSchema } from 'src/fees/schemas/fee.schema';
import { UnionistsModule } from 'src/unionists/unionists.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Fee.name, schema: FeeSchema }]),
    UnionistsModule,
  ],
  controllers: [FeesController],
  providers: [FeesService],
})
export class FeesModule {}
