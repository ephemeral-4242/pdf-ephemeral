'use client';

import { useSearchParams } from 'next/navigation';
import AnalysisResult from '../../components/AnalysisResults';

export default function AnalysisResultsPage() {
  const searchParams = useSearchParams();
  const analysisResult = searchParams.get('analysisResult');

  if (!analysisResult) {
    return <div>No analysis results available.</div>;
  }

  return (
    <div className='container mx-auto py-8'>
      <h1 className='text-4xl font-extrabold text-center text-gray-900 mb-8'>
        Analysis Results
      </h1>
      <AnalysisResult analysisResult={JSON.parse(analysisResult)} />
    </div>
  );
}
