import React from 'react';

interface AnalysisResultProps {
  analysisResult: string;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysisResult }) => {
  return (
    <div className='bg-white shadow-lg rounded-lg p-6 mt-6'>
      <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
        Analysis Result
      </h2>
      <pre className='bg-gray-100 p-4 rounded-md overflow-auto text-sm text-gray-700 whitespace-pre-wrap'>
        {analysisResult}
      </pre>
    </div>
  );
};

export default AnalysisResult;
