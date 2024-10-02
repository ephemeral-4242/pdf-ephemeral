export interface IFileService {
  createFolder(folderPath: string): void;
  saveFile(filePath: string, buffer: Buffer): void;
  deleteFile(filePath: string): void;
  getFilePath(folderPath: string, filename: string): string;
}

export const FILE_SERVICE = 'FILE_SERVICE';
