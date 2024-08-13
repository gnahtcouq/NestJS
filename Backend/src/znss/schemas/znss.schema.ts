import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ZnssDocument = HydratedDocument<Znss>;

@Schema({ timestamps: true })
export class Znss {
  @Prop()
  access_token: string;

  @Prop()
  refresh_token: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;
}

export const ZnssSchema = SchemaFactory.createForClass(Znss);
