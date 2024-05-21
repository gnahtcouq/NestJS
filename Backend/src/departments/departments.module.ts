/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Departments,
  DepartmentsSchema,
} from 'src/departments/schemas/department.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Departments.name, schema: DepartmentsSchema },
    ]),
  ],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}
