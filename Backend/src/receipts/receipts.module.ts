import { Module } from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
import { ReceiptsController } from './receipts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Receipt, ReceiptSchema } from 'src/receipts/schemas/receipt.schema';
import { IncomeCategoriesModule } from 'src/income-categories/income-categories.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    UsersModule,
    IncomeCategoriesModule,
    MongooseModule.forFeature([{ name: Receipt.name, schema: ReceiptSchema }]),
  ],
  controllers: [ReceiptsController],
  providers: [ReceiptsService],
  exports: [ReceiptsService],
})
export class ReceiptsModule {}
