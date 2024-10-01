import { useState } from 'react';
import { api } from '../api/routes';
import toast from 'react-hot-toast';

export const usePdfUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

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
      const result = await api.pdf.upload(formData, (chunk) => {
        setUploadProgress(chunk);
      });

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
      setUploadProgress('');
    }
  };

  return { uploadPdf, isUploading, uploadProgress };
};
