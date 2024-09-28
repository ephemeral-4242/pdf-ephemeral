import React, { useState } from 'react';
import { uploadPdf } from '../api/pdf';

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

  const renderAnalysisSection = (title: string, content: any) => {
    if (!content) return null;

    if (typeof content === 'string') {
      return (
        <div>
          <h3 className='text-lg font-medium'>{title}</h3>
          <p className='bg-gray-100 p-4 rounded-md'>{content}</p>
        </div>
      );
    }

    if (Array.isArray(content)) {
      return (
        <div>
          <h3 className='text-lg font-medium'>{title}</h3>
          <ul className='list-disc list-inside bg-gray-100 p-4 rounded-md'>
            {content.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      );
    }

    if (typeof content === 'object') {
      return (
        <div>
          <h3 className='text-lg font-medium'>{title}</h3>
          <pre className='bg-gray-100 p-4 rounded-md overflow-auto'>
            {JSON.stringify(content, null, 2)}
          </pre>
        </div>
      );
    }

    return null;
  };

  return (
    <div className='space-y-6'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label
            htmlFor='pdf-upload'
            className='block text-sm font-medium text-gray-700'
          >
            Upload PDF Contract
          </label>
          <input
            id='pdf-upload'
            type='file'
            accept='.pdf'
            onChange={handleFileChange}
            className='mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100'
          />
        </div>
        <button
          type='submit'
          disabled={isUploading || !file}
          className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400'
        >
          {isUploading ? 'Analyzing...' : 'Upload and Analyze'}
        </button>
      </form>

      {analysisResult && (
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold'>Contract Analysis</h2>
          {renderAnalysisSection('Summary', analysisResult.summary)}
          {renderAnalysisSection(
            'Key Data Points',
            analysisResult.keyDataPoints
          )}
          {renderAnalysisSection(
            'Potential Risks',
            analysisResult.potentialRisks
          )}
          {renderAnalysisSection(
            'Suggestions for Improvement',
            analysisResult.suggestions
          )}
          {analysisResult.rawResponse && (
            <div>
              <h3 className='text-lg font-medium'>Raw Response</h3>
              <pre className='bg-gray-100 p-4 rounded-md overflow-auto'>
                {analysisResult.rawResponse}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PdfUpload;
