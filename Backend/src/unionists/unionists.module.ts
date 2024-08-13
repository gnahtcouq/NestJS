import { forwardRef, Module } from '@nestjs/common';
import { UnionistsService } from './unionists.service';
import { UnionistsController } from './unionists.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Unionist,
  UnionistSchema,
} from 'src/unionists/schemas/unionist.schema';
import { UsersModule } from 'src/users/users.module';
import { ZnssModule } from 'src/znss/znss.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    MongooseModule.forFeature([
      { name: Unionist.name, schema: UnionistSchema },
    ]),
    ZnssModule,
  ],
  controllers: [UnionistsController],
  providers: [UnionistsService],
  exports: [UnionistsService],
})
export class UnionistsModule {}
