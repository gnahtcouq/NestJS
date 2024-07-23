/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';

export type ReceiptDocument = HydratedDocument<Receipt>;

@Schema({ timestamps: true })
export class Receipt {
  @Prop()
  userId: string;

  @Prop()
  receiptId: string;

  @Prop()
  description: string;

  @Prop()
  time: Date;

  @Prop()
  amount: string;

  @Prop()
  incomeCategoryId: string;

  @Prop({ type: Object })
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);
