import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { IFileService } from '../interface/file-service.interface';

@Injectable()
export class DiskService implements IFileService {
  createFolder(folderPath: string): void {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
  }

  saveFile(filePath: string, buffer: Buffer): void {
    fs.writeFileSync(filePath, buffer);
  }

  deleteFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  getFilePath(folderPath: string, filename: string): string {
    return path.join(folderPath, filename);
  }
}
