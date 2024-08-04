import { Injectable } from '@nestjs/common';
import { DocumentsService } from 'src/documents/documents.service';

@Injectable()
export class DocumentMiddleware {
  constructor(private readonly documentService: DocumentsService) {}

  use() {
    return async (req: any, res: any, next: () => void) => {
      const url = decodeURIComponent(req.url.split('/').pop());
      const document = await this.documentService.findByUrl(url);

      if (!document) {
        return res.status(404).send('Không tìm thấy tệp tin!');
      }

      if (document && document.status === 'INACTIVE') {
        return res
          .status(403)
          .send(
            'Tệp tin đã bị hạn chế quyền truy cập. Hãy liên hệ với quản trị viên của bạn!',
          );
      }

      next();
    };
  }
}
