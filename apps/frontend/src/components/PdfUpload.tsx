import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiFile, FiX } from 'react-icons/fi';
import { usePdfUpload } from '../hooks/usePdfUpload';
import { Button } from './common/Button';
import { api } from '../api/routes';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/common/Select';

export interface Folder {
  id: string;
  name: string;
}

interface PdfUploadProps {
  onUploadSuccess: (url: string) => void;
}

const PdfUpload: React.FC<PdfUploadProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const { uploadPdf, isUploading } = usePdfUpload();

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

    await uploadPdf(file, onUploadSuccess, selectedFolder);
    setFile(null);
    setSelectedFolder(null);
  };

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const fetchedFolders = await api.pdf.getAllFolders();
        setFolders(fetchedFolders);
      } catch (error) {
        console.error('Error fetching folders:', error);
      }
    };

    fetchFolders();
  }, []);

  return (
    <div className='w-full max-w-md mx-auto'>
      <form onSubmit={handleSubmit} className='space-y-8'>
        {/* File Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-500 hover:border-blue-500 hover:bg-gray-800'
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className='flex items-center justify-center space-x-4'>
              <FiFile className='text-blue-500 text-4xl' />
              <span className='text-sm font-medium text-gray-200 truncate max-w-[200px]'>
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
                <FiX className='text-2xl' />
              </button>
            </div>
          ) : (
            <div>
              <FiUploadCloud className='mx-auto text-6xl text-gray-400 mb-6' />
              <p className='text-lg font-medium text-gray-200 mb-2'>
                Drag and drop your PDF here
              </p>
              <p className='text-sm text-gray-400'>or click to select</p>
            </div>
          )}
        </div>

        {/* Folder Selection - only show if there are folders */}
        {folders.length > 0 && (
          <div>
            <label
              htmlFor='folder'
              className='block text-sm font-medium text-gray-200 mb-3'
            >
              Select Folder (Optional)
            </label>
            <div className='flex space-x-3'>
              <Select onValueChange={(value) => setSelectedFolder(value)}>
                <SelectTrigger id='folder' name='folder' className='w-full'>
                  <SelectValue placeholder='Choose a folder' />
                </SelectTrigger>
                <SelectContent>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <Button
          type='submit'
          disabled={isUploading || !file}
          className='w-full py-3'
        >
          {isUploading ? (
            <>
              <svg
                className='animate-spin h-5 w-5 mr-2 inline-block'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25 text-white'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75 text-white'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              Uploading...
            </>
          ) : (
            'Upload PDF'
          )}
        </Button>
      </form>
    </div>
  );
};

export default PdfUpload;
