import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { Permission } from 'src/permissions/schemas/permission.schema';

export type UnionistDocument = HydratedDocument<Unionist>;

@Schema({ timestamps: true })
export class Unionist {
  @Prop({ unique: true })
  id: string;

  @Prop()
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  dateOfBirth: Date;

  @Prop()
  gender: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  address: string;

  @Prop()
  CCCD: string; //căn cước công dân

  @Prop()
  joiningDate: Date; //ngày chuyển đến

  @Prop()
  leavingDate: Date; //ngày chuyển đi

  @Prop()
  unionEntryDate: Date; //ngày vào công đoàn

  @Prop()
  note: string; //ghi chú

  @Prop()
  departmentId: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: Permission.name })
  permissions: Permission[];

  @Prop()
  refreshToken: string;

  @Prop()
  verificationCode: string;

  @Prop()
  verificationExpires: Date;

  @Prop()
  verificationCodePassword: string;

  @Prop()
  verificationExpiresPassword: Date;

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

export const UnionistSchema = SchemaFactory.createForClass(Unionist);

UnionistSchema.pre('save', async function (next) {
  try {
    if (this.isNew) {
      const UnionistModel = this.constructor as Model<UnionistDocument>;
      const lastUnionist = await UnionistModel.findOne().sort({ id: -1 });
      const lastId =
        lastUnionist && lastUnionist.id
          ? parseInt(lastUnionist.id.slice(2), 10)
          : 0;

      this.id = `CD${(lastId + 1).toString().padStart(5, '0')}`;
    }

    next();
  } catch (error) {
    next(error);
  }
});
