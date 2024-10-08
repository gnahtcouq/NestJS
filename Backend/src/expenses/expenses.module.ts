import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Expense, ExpenseSchema } from 'src/expenses/schemas/expense.schema';
import { UsersModule } from 'src/users/users.module';
import { ExpenseCategoriesModule } from 'src/expense-categories/expense-categories.module';

@Module({
  imports: [
    UsersModule,
    ExpenseCategoriesModule,
    MongooseModule.forFeature([{ name: Expense.name, schema: ExpenseSchema }]),
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
