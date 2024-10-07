import { useState } from 'react';
import { api } from '../api/routes';
import toast from 'react-hot-toast';

interface UploadFolderResult {
  urls?: string[];
  errors?: string[];
}

export const usePdfUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadPdf = async (
    file: File,
    onSuccess: (url: string) => void,
    folderId: string | null
  ) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (folderId !== null) {
      formData.append('folderId', folderId);
    }

    try {
      const result = await api.pdf.upload(formData);

      if (!result.url) {
        throw new Error('No URL returned from server');
      }

      toast.success('PDF uploaded successfully');
      onSuccess(result.url);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error('Error uploading PDF');
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFolder = async (
    files: File[],
    folderName: string
  ): Promise<UploadFolderResult> => {
    setIsUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('folderName', folderName);

    try {
      const result = await api.pdf.uploadFolder(formData);
      return result;
    } catch (error) {
      console.error('Error uploading folder:', error);
      return { errors: ['Error uploading folder'] };
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadPdf, uploadFolder, isUploading };
};
