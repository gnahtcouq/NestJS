import { Module } from '@nestjs/common';
import { IncomeCategoriesService } from './income-categories.service';
import { IncomeCategoriesController } from './income-categories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  IncomeCategory,
  IncomeCategorySchema,
} from 'src/income-categories/schemas/income-category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: IncomeCategory.name, schema: IncomeCategorySchema },
    ]),
  ],
  controllers: [IncomeCategoriesController],
  providers: [IncomeCategoriesService],
  exports: [IncomeCategoriesService],
})
export class IncomeCategoriesModule {}
