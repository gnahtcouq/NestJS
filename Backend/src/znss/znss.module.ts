import { Module } from '@nestjs/common';
import { ZnssService } from './znss.service';
import { ZnssController } from './znss.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Znss, ZnssSchema } from 'src/znss/schemas/znss.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Znss.name, schema: ZnssSchema }]),
  ],
  controllers: [ZnssController],
  providers: [ZnssService],
  exports: [ZnssService],
})
export class ZnssModule {}
