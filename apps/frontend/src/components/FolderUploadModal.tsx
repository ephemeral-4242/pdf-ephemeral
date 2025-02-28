import React, { useState, useRef } from 'react';
import { usePdfUpload } from '@/hooks/usePdfUpload';

interface FolderUploadModalProps {
  onClose: () => void;
  onUploadSuccess: (urls: string[]) => void;
}

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // extend this interface to allow any custom attribute
    [key: string]: any;
  }
}

const FolderUploadModal: React.FC<FolderUploadModalProps> = ({
  onClose,
  onUploadSuccess,
}) => {
  const { uploadFolder, isUploading } = usePdfUpload();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const folderName = fileArray[0].webkitRelativePath.split('/')[0];
    setSelectedFolder(folderName);
    setSelectedFiles(fileArray);
    setError(null);
    setSuccessMessage(null);
  };

  const handleUpload = async () => {
    if (!selectedFolder || selectedFiles.length === 0) {
      setError('No folder selected');
      return;
    }

    // Basic validation: check if all files are PDFs
    const nonPdfFiles = selectedFiles.filter(
      (file) => !file.type.includes('pdf')
    );
    if (nonPdfFiles.length > 0) {
      setError(
        `${nonPdfFiles.length} non-PDF files found. Please select only PDF files.`
      );
      return;
    }

    try {
      const result = await uploadFolder(selectedFiles, selectedFolder);
      if (result.urls && result.urls.length > 0) {
        setSuccessMessage(`Successfully uploaded ${result.urls.length} PDF(s)`);
        onUploadSuccess(result.urls);
      } else {
        setError('No PDFs were successfully uploaded');
      }
    } catch (err) {
      setError(
        `Error uploading folder: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
      <div className='bg-gray-800 p-8 rounded-xl shadow-2xl relative max-w-md w-full'>
        <button
          className='absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors duration-200'
          onClick={onClose}
        >
          <svg
            className='w-6 h-6'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
        <h2 className='text-2xl font-bold mb-6 text-gray-100'>Upload Folder</h2>
        <div className='mb-6'>
          <label
            htmlFor='folder-upload'
            className='flex flex-col items-center px-4 py-6 bg-gray-700 text-gray-300 rounded-lg shadow-lg tracking-wide uppercase border border-gray-600 cursor-pointer hover:bg-gray-600 hover:text-white transition-all duration-200'
          >
            <svg
              className='w-8 h-8'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z'
              />
            </svg>
            <span className='mt-2 text-base leading-normal'>
              {selectedFolder ? selectedFolder : 'Select a folder'}
            </span>
            <input
              ref={fileInputRef}
              id='folder-upload'
              type='file'
              webkitdirectory=''
              directory=''
              multiple
              onChange={handleFolderSelect}
              className='hidden'
            />
          </label>
        </div>
        {selectedFolder && (
          <button
            onClick={handleUpload}
            className='w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200'
            disabled={isUploading}
          >
            Upload Folder
          </button>
        )}
        {isUploading && (
          <div className='mb-4 text-center'>
            <div className='inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500'></div>
            <p className='mt-2 text-gray-300'>Uploading...</p>
          </div>
        )}
        {error && <p className='text-red-500 mt-2 text-center'>{error}</p>}
        {successMessage && (
          <p className='text-green-500 mt-2 text-center'>{successMessage}</p>
        )}
      </div>
    </div>
  );
};

export default FolderUploadModal;
