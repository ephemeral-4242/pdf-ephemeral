import React from 'react';

interface AnalysisResultProps {
  analysisResult: any;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysisResult }) => {
  const renderAnalysisSection = (title: string, content: any) => {
    if (!content) return null;

    if (typeof content === 'string') {
      return (
        <div>
          <h3 className='text-lg font-medium text-gray-800'>{title}</h3>
          <p className='bg-gray-100 p-4 rounded-md text-gray-700'>{content}</p>
        </div>
      );
    }

    if (Array.isArray(content)) {
      return (
        <div>
          <h3 className='text-lg font-medium text-gray-800'>{title}</h3>
          <ul className='list-disc list-inside bg-gray-100 p-4 rounded-md text-gray-700'>
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
          <h3 className='text-lg font-medium text-gray-800'>{title}</h3>
          <pre className='bg-gray-100 p-4 rounded-md overflow-auto text-gray-700'>
            {JSON.stringify(content, null, 2)}
          </pre>
        </div>
      );
    }

    return null;
  };

  return (
    <div className='space-y-4 mt-6'>
      <h2 className='text-xl font-semibold text-gray-900'>Contract Analysis</h2>
      {renderAnalysisSection('Summary', analysisResult.summary)}
      {renderAnalysisSection('Key Data Points', analysisResult.keyDataPoints)}
      {renderAnalysisSection('Potential Risks', analysisResult.potentialRisks)}
      {renderAnalysisSection(
        'Suggestions for Improvement',
        analysisResult.suggestions
      )}
      {analysisResult.rawResponse && (
        <div>
          <h3 className='text-lg font-medium text-gray-800'>Raw Response</h3>
          <pre className='bg-gray-100 p-4 rounded-md overflow-auto text-gray-700'>
            {analysisResult.rawResponse}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AnalysisResult;
