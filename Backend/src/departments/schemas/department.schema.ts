/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';

export type DepartmentDocument = HydratedDocument<Department>;

@Schema({ timestamps: true })
export class Department {
  @Prop({ unique: true })
  id: string;

  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  logo: string;

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

export const DepartmentSchema = SchemaFactory.createForClass(Department);

DepartmentSchema.pre('save', async function (next) {
  try {
    if (this.isNew) {
      const DepartmentModel = this.constructor as Model<DepartmentDocument>;
      const lastDepartment = await DepartmentModel.findOne().sort({ id: -1 });
      const lastId =
        lastDepartment && lastDepartment.id
          ? parseInt(lastDepartment.id.slice(2), 10)
          : 0;

      this.id = `DV${(lastId + 1).toString().padStart(2, '0')}`;
    }

    if (!this.id) {
      throw new Error('Mã đơn vị không được để trống');
    }

    next();
  } catch (error) {
    next(error);
  }
});
