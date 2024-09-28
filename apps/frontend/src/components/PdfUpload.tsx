import React, { useState } from 'react';
import { uploadPdf } from '../api/pdf';
import AnalysisResult from './AnalysisResults';

const PdfUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

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
      const result = await uploadPdf(formData);
      setAnalysisResult(result.analysis);
    } catch (error) {
      console.error('Error uploading PDF:', error);
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
        </form>

        {analysisResult && <AnalysisResult analysisResult={analysisResult} />}
      </div>
    </div>
  );
};

export default PdfUpload;
