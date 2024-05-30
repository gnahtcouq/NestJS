import { Injectable } from '@nestjs/common';
import { CreateUnionistDto } from './dto/create-unionist.dto';
import { UpdateUnionistDto } from './dto/update-unionist.dto';

@Injectable()
export class UnionistsService {
  create(createUnionistDto: CreateUnionistDto) {
    return 'This action adds a new unionist';
  }

  findAll() {
    return `This action returns all unionists`;
  }

  findOne(id: number) {
    return `This action returns a #${id} unionist`;
  }

  update(id: number, updateUnionistDto: UpdateUnionistDto) {
    return `This action updates a #${id} unionist`;
  }

  remove(id: number) {
    return `This action removes a #${id} unionist`;
  }
}
