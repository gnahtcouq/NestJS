import { Module } from '@nestjs/common';
import { DatabasesService } from './databases.service';
import { DatabasesController } from './databases.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import {
  Permission,
  PermissionSchema,
} from 'src/permissions/schemas/permission.schema';
import { UsersService } from 'src/users/users.service';
import {
  Unionist,
  UnionistSchema,
} from 'src/unionists/schemas/unionist.schema';
import { UnionistsService } from 'src/unionists/unionists.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Unionist.name, schema: UnionistSchema },
      { name: Permission.name, schema: PermissionSchema },
    ]),
  ],
  controllers: [DatabasesController],
  providers: [DatabasesService, UsersService, UnionistsService],
})
export class DatabasesModule {}
