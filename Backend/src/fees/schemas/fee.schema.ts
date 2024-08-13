import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type FeeDocument = HydratedDocument<Fee>;

@Schema({ timestamps: true })
export class Fee {
  @Prop()
  unionistId: string;

  @Prop()
  monthYear: string;

  @Prop()
  fee: string;

  @Prop({ type: mongoose.Schema.Types.Array })
  history: {
    monthYear: string;
    fee: string;
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

export const FeeSchema = SchemaFactory.createForClass(Fee);
