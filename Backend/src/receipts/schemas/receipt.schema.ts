import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ReceiptDocument = HydratedDocument<Receipt>;

@Schema({ timestamps: true })
export class Receipt {
  @Prop()
  id: string;

  @Prop()
  description: string;

  @Prop()
  time: Date;

  @Prop()
  amount: string;

  @Prop()
  userId: string;

  @Prop()
  incomeCategoryId: string;

  @Prop()
  documentId: string;

  @Prop({ type: mongoose.Schema.Types.Array })
  history: {
    description: string;
    time: Date;
    amount: string;
    updatedAt: Date;
    updatedBy: {
      _id: mongoose.Schema.Types.ObjectId;
      email: string;
    };
  }[];

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
