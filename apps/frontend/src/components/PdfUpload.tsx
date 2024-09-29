import React, { useState } from 'react';
import { uploadPdf } from '../api/pdf';
import AnalysisResult from './AnalysisResults';
import { useRouter } from 'next/navigation';

const PdfUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulating upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prevProgress) => {
          if (prevProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prevProgress + 10;
        });
      }, 500);

      const result = await uploadPdf(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);

      router.push(
        `/analysis-results?analysisResult=${encodeURIComponent(JSON.stringify(result.analysis))}`
      );
    } catch (error) {
      console.error('Error uploading PDF:', error);
      // Consider adding a toast notification here for the error
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='flex items-center justify-center h-96 bg-gray-100 rounded-lg'>
      <div className='bg-white rounded-lg shadow-lg p-8 w-full max-w-lg'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='text-center'>
            <label
              htmlFor='pdf-upload'
              className='block text-sm font-medium text-gray-700'
            >
              Drag and drop your PDF contracts here
            </label>
            <input
              id='pdf-upload'
              type='file'
              accept='.pdf'
              onChange={handleFileChange}
              className='mt-4 block w-full px-6 py-4 border-2 border-dashed border-red-600 text-center text-red-600 rounded-md cursor-pointer hover:bg-red-50'
            />
          </div>
          <div className='text-center'>
            <button
              type='submit'
              disabled={isUploading || !file}
              className='w-full py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400'
            >
              {isUploading ? 'Analyzing...' : 'Upload and Analyze'}
            </button>
          </div>
          {isUploading && (
            <div className='mt-4'>
              <div className='relative pt-1'>
                <div className='flex mb-2 items-center justify-between'>
                  <div>
                    <span className='text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-200'>
                      {uploadProgress < 100 ? 'Uploading' : 'Processing'}
                    </span>
                  </div>
                  <div className='text-right'>
                    <span className='text-xs font-semibold inline-block text-red-600'>
                      {uploadProgress}%
                    </span>
                  </div>
                </div>
                <div className='overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-200'>
                  <div
                    style={{ width: `${uploadProgress}%` }}
                    className='shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500 transition-all duration-500 ease-out'
                  ></div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PdfUpload;
