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
    <main className='flex flex-col min-h-screen bg-white'>
      <header className='flex justify-between items-center py-4 bg-blue-600 text-white px-6'>
        <h1 className='text-xl font-bold'>PDF Chat Application</h1>
        <nav className='flex space-x-4'>
          <button onClick={handleReset} className='hover:underline'>
            Upload New PDF
          </button>
        </nav>
      </header>

      <div className='flex-grow flex'>
        {!isPdfUploaded ? (
          <div className='w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
            <PdfUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        ) : (
          <>
            <div className='w-1/2 h-screen overflow-auto'>
              {pdfUrl && <PDFViewer url={pdfUrl} />}
            </div>
            <div className='w-1/2 h-screen overflow-auto p-6'>
              <PdfChat />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
