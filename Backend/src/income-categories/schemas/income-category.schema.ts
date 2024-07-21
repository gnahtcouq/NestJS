/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type IncomeCategoryDocument = HydratedDocument<IncomeCategory>;

@Schema({ timestamps: true })
export class IncomeCategory {
  @Prop()
  incomeCategoryId: string;

  @Prop()
  description: string;

  @Prop()
  budget: string;

  @Prop()
  year: string;

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

export const IncomeCategorySchema =
  SchemaFactory.createForClass(IncomeCategory);
