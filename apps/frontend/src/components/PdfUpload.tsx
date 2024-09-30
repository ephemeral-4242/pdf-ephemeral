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
    <div className='w-full max-w-md mx-auto'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ease-in-out ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className='flex items-center justify-center space-x-3'>
              <FiFile className='text-blue-500 text-3xl' />
              <span className='text-sm font-medium text-gray-700 truncate max-w-[200px]'>
                {file.name}
              </span>
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className='text-red-500 hover:text-red-700 transition-colors duration-200'
              >
                <FiX className='text-xl' />
              </button>
            </div>
          ) : (
            <div>
              <FiUploadCloud className='mx-auto text-5xl text-gray-400 mb-4' />
              <p className='text-sm font-medium text-gray-700 mb-2'>
                Drag and drop your PDF here
              </p>
              <p className='text-xs text-gray-500'>or click to select</p>
            </div>
          )}
        </div>
        <button
          type='submit'
          disabled={isUploading || !file}
          className='w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 ease-in-out flex items-center justify-center space-x-2'
        >
          {isUploading ? (
            <>
              <svg
                className='animate-spin h-5 w-5 text-white'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <FiUploadCloud className='text-xl' />
              <span>Upload PDF</span>
            </>
          )}
        </button>
        {uploadProgress && (
          <div className='mt-2 text-sm text-gray-600 text-center'>
            {uploadProgress}
          </div>
        )}
      </form>
    </div>
  );
};

export default PdfUpload;
