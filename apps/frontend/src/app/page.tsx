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
    <main className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-4xl font-extrabold text-center text-gray-900 mb-8 sm:mb-12'>
          PDF Chat Application
        </h1>
        <p className='text-xl text-center text-gray-600 mb-12'>
          {data?.message}
        </p>
        <div className='bg-white shadow-xl rounded-lg overflow-hidden'>
          <div className='p-6 sm:p-8'>
            <PdfUpload />
          </div>
          <div className='border-t border-gray-200'></div>
          <div className='p-6 sm:p-8'>
            <PdfChat />
          </div>
        </div>
      </div>
    </main>
  );
}
