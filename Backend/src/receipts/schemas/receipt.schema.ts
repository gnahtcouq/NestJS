/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ReceiptDocument = HydratedDocument<Receipt>;

@Schema({ timestamps: true })
export class Receipt {
  @Prop({ type: Object })
  user: {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
  };

  @Prop()
  description: string;

  @Prop()
  time: string;

  @Prop()
  amount: string;

  @Prop({ type: Object })
  incomeCategory: {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
  };

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
