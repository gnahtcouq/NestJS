import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UnionistsService } from './unionists.service';
import { CreateUnionistDto } from './dto/create-unionist.dto';
import { UpdateUnionistDto } from './dto/update-unionist.dto';

@Controller('unionists')
export class UnionistsController {
  constructor(private readonly unionistsService: UnionistsService) {}

  @Post()
  create(@Body() createUnionistDto: CreateUnionistDto) {
    return this.unionistsService.create(createUnionistDto);
  }

  @Get()
  findAll() {
    return this.unionistsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unionistsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUnionistDto: UpdateUnionistDto) {
    return this.unionistsService.update(+id, updateUnionistDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.unionistsService.remove(+id);
  }
}
