import React, { useState, useCallback } from 'react';
import { uploadPdf } from '../api/pdf';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { FiUploadCloud, FiFile, FiX } from 'react-icons/fi';

const PdfUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

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
    setAnalysisResult('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      await uploadPdf(formData, (chunk: string) => {
        setAnalysisResult((prev) => prev + chunk);
      });
    } catch (error) {
      console.error('Error uploading PDF:', error);
      // Consider adding a toast notification here for the error
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='bg-white rounded-lg shadow-xl p-8 w-full max-w-md'
      >
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type='submit'
            disabled={isUploading || !file}
            className='w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 ease-in-out flex items-center justify-center space-x-2'
          >
            {isUploading ? (
              <>
                <Spinner />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <FiUploadCloud />
                <span>Upload and Analyze</span>
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      {analysisResult && (
        <div className='bg-white shadow-lg rounded-lg p-6 mt-6 w-full max-w-3xl'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
            Analysis Result
          </h2>
          <pre className='bg-gray-100 p-4 rounded-md overflow-auto text-sm text-gray-700 whitespace-pre-wrap'>
            {analysisResult}
          </pre>
        </div>
      )}
    </div>
  );
};

const Spinner = () => (
  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
);

export default PdfUpload;
