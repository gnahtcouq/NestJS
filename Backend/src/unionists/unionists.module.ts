import { Module } from '@nestjs/common';
import { UnionistsService } from './unionists.service';
import { UnionistsController } from './unionists.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Unionist,
  UnionistSchema,
} from 'src/unionists/schemas/unionist.schema';
import { Role, RoleSchema } from 'src/roles/schemas/role.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Unionist.name, schema: UnionistSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [UnionistsController],
  providers: [UnionistsService],
  exports: [UnionistsService],
})
export class UnionistsModule {}
