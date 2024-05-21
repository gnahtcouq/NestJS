import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Document,
  DocumentSchema,
} from 'src/documents/schemas/document.schema';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService],
  imports: [
    MongooseModule.forFeature([
      { name: Document.name, schema: DocumentSchema },
    ]),
  ],
})
export class DocumentsModule {}
