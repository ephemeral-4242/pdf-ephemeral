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
    <div className='min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex flex-col items-center justify-center'>
      <div className='w-full max-w-2xl px-4 py-8'>
        <header className='mb-8 text-center'>
          <h1 className='text-4xl font-extrabold text-gray-900'>
            PDF Chat Application
          </h1>
          <p className='text-lg text-gray-600 mt-2'>
            Upload your PDF and start chatting with it!
          </p>
        </header>

        <main className='bg-white rounded-lg shadow-lg p-6'>
          <PdfUpload onUploadSuccess={handleUploadSuccess} />
        </main>

        <section className='mt-8 text-center'>
          <h2 className='text-2xl font-bold text-gray-800'>How It Works</h2>
          <p className='text-gray-600 mt-2'>
            Simply upload your PDF document, and our application will process
            it. Once uploaded, you can start a chat session with the content of
            the PDF.
          </p>
        </section>

        <section className='mt-8 text-center'>
          <h2 className='text-2xl font-bold text-gray-800'>Features</h2>
          <ul className='list-disc list-inside text-gray-600 mt-2'>
            <li>Easy PDF Upload</li>
            <li>Instant Chat with PDF Content</li>
            <li>Secure and Private</li>
            <li>Supports Multiple Languages</li>
          </ul>
        </section>

        <footer className='mt-8 text-center text-gray-500'>
          <p>&copy; 2023 PDF Chat Application. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
