export interface PDFDocument {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  content: string;
  uploadDate: Date;
  userId?: string;
  folder?: {
    id: string;
    name: string;
  };
  tags: string[];
}
