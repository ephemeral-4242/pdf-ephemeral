'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import PdfUpload from '../components/PdfUpload';
import PdfChat from '../components/PdfChat';

const PDFViewer = dynamic(() => import('../components/PDFViewer'), {
  ssr: false,
});

export default function Home() {
  const [isPdfUploaded, setIsPdfUploaded] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleUploadSuccess = (url: string) => {
    setIsPdfUploaded(true);
    setPdfUrl(url);
  };

  const handleReset = () => {
    setIsPdfUploaded(false);
    setPdfUrl(null);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-extrabold text-gray-900'>
            PDF Chat Application
          </h1>
          {isPdfUploaded && (
            <button
              onClick={handleReset}
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
            >
              Upload New PDF
            </button>
          )}
        </div>

        {!isPdfUploaded ? (
          <div className='bg-white rounded-lg shadow-xl p-8'>
            <PdfUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        ) : (
          <div className='flex gap-8 h-[calc(100vh-12rem)]'>
            <div className='w-1/2 bg-white rounded-lg shadow-xl overflow-hidden'>
              {pdfUrl && <PDFViewer url={pdfUrl} />}
            </div>
            <div className='w-1/2 bg-white rounded-lg shadow-xl overflow-hidden'>
              <PdfChat />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
