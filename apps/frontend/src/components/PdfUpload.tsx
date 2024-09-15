import React, { useState } from 'react';

const PdfUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:4000/pdf/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log(data);
      // You might want to add some success feedback here
    } catch (error) {
      console.error('Error uploading PDF:', error);
      // You might want to add some error feedback here
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='flex items-center justify-center w-full'>
        <label
          htmlFor='dropzone-file'
          className='flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100'
        >
          <div className='flex flex-col items-center justify-center pt-5 pb-6'>
            <svg
              className='w-10 h-10 mb-3 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
              ></path>
            </svg>
            <p className='mb-2 text-sm text-gray-500'>
              <span className='font-semibold'>Click to upload</span> or drag and
              drop
            </p>
            <p className='text-xs text-gray-500'>PDF (MAX. 10MB)</p>
          </div>
          <input
            id='dropzone-file'
            type='file'
            accept='.pdf'
            onChange={handleFileChange}
            className='hidden'
          />
        </label>
      </div>
      {file && (
        <p className='text-sm text-gray-500 text-center'>
          Selected file: {file.name}
        </p>
      )}
      <div className='flex justify-center'>
        <button
          type='submit'
          disabled={!file || isUploading}
          className={`px-4 py-2 text-white rounded-md transition-colors ${
            !file || isUploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isUploading ? 'Uploading...' : 'Upload PDF'}
        </button>
      </div>
    </form>
  );
};

export default PdfUpload;
