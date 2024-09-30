import { useState } from 'react';
import { api } from '../api/routes';
import toast from 'react-hot-toast';

export const usePdfOperations = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const uploadPdf = async (file: File, onSuccess: (url: string) => void) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await api.pdf.upload(formData, (chunk) => {
        setUploadProgress(chunk);
      });
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

  const chatWithPdf = async (question: string) => {
    try {
      return await api.pdf.chat(question);
    } catch (error) {
      console.error('Error chatting with PDF:', error);
      toast.error('Error chatting with PDF');
    }
  };

  return { uploadPdf, chatWithPdf, isUploading, uploadProgress };
};
