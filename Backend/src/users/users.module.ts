import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { UnionistsModule } from 'src/unionists/unionists.module';
import { ZnssModule } from 'src/znss/znss.module';

@Module({
  imports: [
    forwardRef(() => UnionistsModule),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ZnssModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
