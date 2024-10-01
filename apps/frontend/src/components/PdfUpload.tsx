import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiFile, FiX } from 'react-icons/fi';
import { usePdfUpload } from '../hooks/usePdfUpload';
import { Button } from './common/Button';

const PdfUpload = ({
  onUploadSuccess,
}: {
  onUploadSuccess: (url: string) => void;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const { uploadPdf, isUploading, uploadProgress } = usePdfUpload();

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

    await uploadPdf(file, onUploadSuccess);
    setFile(null);
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
        <Button
          type='submit'
          disabled={isUploading || !file}
          className='w-full'
        >
          {isUploading ? (
            <>
              <svg
                className='animate-spin h-5 w-5 mr-2'
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
              Uploading...
            </>
          ) : (
            <>
              <FiUploadCloud className='mr-2' />
              Upload PDF
            </>
          )}
        </Button>
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
