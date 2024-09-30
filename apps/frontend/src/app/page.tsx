'use client';

import { useRouter } from 'next/navigation';
import PdfUpload from '../components/PdfUpload';

export default function Home() {
  const router = useRouter();

  const handleUploadSuccess = (url: string) => {
    // Extract the ID from the URL
    const id = url.split('/').pop();
    router.push(`/chat/${id}`);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='w-full px-2 sm:px-4 py-4'>
        <div className='flex justify-between items-center mb-4'>
          <h1 className='text-2xl font-bold text-gray-900'>
            PDF Chat Application
          </h1>
        </div>

        <div className='bg-white rounded-lg shadow-md p-4'>
          <PdfUpload onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>
    </div>
  );
}
