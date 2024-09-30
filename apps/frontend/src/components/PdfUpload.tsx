import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiFile, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { api } from '../api/routes';

// Update the prop type to accept a function that takes a string parameter
const PdfUpload = ({
  onUploadSuccess,
}: {
  onUploadSuccess: (url: string) => void;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await api.pdf.upload(formData, (chunk) => {
        setUploadProgress(chunk);
      });

      if (!result.url) {
        throw new Error('No URL returned from server');
      }

      toast.success('PDF uploaded successfully');
      setFile(null);
      onUploadSuccess(result.url);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error('Error uploading PDF');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  return (
    <div className='flex flex-col items-center justify-center'>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ease-in-out ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className='flex items-center justify-center space-x-2'>
              <FiFile className='text-blue-500 text-2xl' />
              <span className='text-sm text-gray-600'>{file.name}</span>
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className='text-red-500 hover:text-red-700'
              >
                <FiX />
              </button>
            </div>
          ) : (
            <div>
              <FiUploadCloud className='mx-auto text-4xl text-gray-400 mb-2' />
              <p className='text-sm text-gray-600'>
                Drag and drop your PDF here, or click to select
              </p>
            </div>
          )}
        </div>
        <button
          type='submit'
          disabled={isUploading || !file}
          className='w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 ease-in-out flex items-center justify-center space-x-2'
        >
          {isUploading ? 'Uploading...' : 'Upload PDF'}
        </button>
      </form>
    </div>
  );
};

export default PdfUpload;
