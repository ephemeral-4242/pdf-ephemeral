'use client';

import { useState } from 'react';
import PdfUpload from '../components/PdfUpload';
import PdfChat from '../components/PdfChat';

export default function Home() {
  const [isPdfUploaded, setIsPdfUploaded] = useState(false);

  const handleUploadSuccess = () => {
    setIsPdfUploaded(true);
  };

  const handleReset = () => {
    setIsPdfUploaded(false);
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

      <div className='flex-grow max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
        {!isPdfUploaded ? (
          <PdfUpload onUploadSuccess={handleUploadSuccess} />
        ) : (
          <PdfChat />
        )}
      </div>
    </main>
  );
}
