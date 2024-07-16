import { Module } from '@nestjs/common';
import { FeesService } from './fees.service';
import { FeesController } from './fees.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Fee, FeeSchema } from 'src/fees/schemas/fee.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Fee.name, schema: FeeSchema }])],
  controllers: [FeesController],
  providers: [FeesService],
})
export class FeesModule {}
