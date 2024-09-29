'use client';

import { useApi } from '../hooks/useApi';
import { getHello } from '../api/hello';
import PdfUpload from '../components/PdfUpload';
import PdfChat from '../components/PdfChat';

export default function Home() {
  const { data, error, isLoading } = useApi(getHello);

  if (isLoading)
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    );

  if (error)
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div
          className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4'
          role='alert'
        >
          <p className='font-bold'>Error</p>
          <p>{error.message}</p>
        </div>
      </div>
    );

  return (
    <main className='min-h-screen bg-white'>
      {/* Top navigation bar */}
      <header className='flex justify-between items-center py-4 bg-red-600 text-white px-6'>
        <h1 className='text-xl font-bold'>ContractEx</h1>
        <nav className='flex space-x-4'>
          <a href='#' className='hover:underline'>
            Dashboard
          </a>
          <a href='#' className='hover:underline'>
            Upload Contracts
          </a>
          <a href='#' className='hover:underline'>
            Results Summary
          </a>
        </nav>
      </header>

      {/* Page content */}
      <div className='max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
        <h1 className='text-4xl font-extrabold text-center text-gray-900 mb-8'>
          Contract Analysis
        </h1>

        <div className='bg-white shadow-xl rounded-lg overflow-hidden'>
          {/* Drag and Drop PDF Upload */}
          <div className='p-6 sm:p-8'>
            <PdfUpload />
          </div>

          {/* Horizontal Divider */}
          <div className='border-t border-gray-200'></div>
        </div>
      </div>
    </main>
  );
}
