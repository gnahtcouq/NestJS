import { Injectable } from '@nestjs/common';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { Faculty, FacultyDocument } from 'src/faculty/schemas/faculty.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

@Injectable()
export class FacultyService {
  constructor(
    @InjectModel(Faculty.name)
    private facultyModel: SoftDeleteModel<FacultyDocument>,
  ) {}

  create(createFacultyDto: CreateFacultyDto) {
    // eslint-disable-next-line prefer-const
    // let faculty = await this.facultyModel.create({
    //   name: createFacultyDto.name,
    //   description: createFacultyDto.description,
    // });

    return this.facultyModel.create({ ...createFacultyDto });
  }

  findAll() {
    return `This action returns all faculty`;
  }

  findOne(id: number) {
    return `This action returns a #${id} faculty`;
  }

  update(id: number, updateFacultyDto: UpdateFacultyDto) {
    return `This action updates a #${id} faculty`;
  }

  remove(id: number) {
    return `This action removes a #${id} faculty`;
  }
}
