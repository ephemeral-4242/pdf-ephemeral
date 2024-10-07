import { useState } from 'react';
import { api } from '../api/routes';
import toast from 'react-hot-toast';

export const usePdfUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadPdf = async (
    file: File,
    onSuccess: (url: string) => void,
    folderId: string
  ) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderId', folderId);

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
    folderName: string,
    onUploadSuccess: (urls: string[]) => void
  ): Promise<string[]> => {
    setIsUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('folderName', folderName);

    try {
      const result = await api.pdf.uploadFolder(formData);

      if (!result.urls || result.urls.length === 0) {
        throw new Error('No URLs returned from server');
      }

      toast.success('Folder uploaded successfully');
      onUploadSuccess(result.urls);
      return result.urls;
    } catch (error) {
      console.error('Error uploading folder:', error);
      toast.error('Error uploading folder');
      return []; // Return an empty array if there's an error
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadPdf, uploadFolder, isUploading };
};
