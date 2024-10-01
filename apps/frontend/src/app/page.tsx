'use client';

import { useRouter } from 'next/navigation';
import PdfUpload from '../components/PdfUpload';
import { Plus, Check, Eye, Languages } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const handleUploadSuccess = (url: string) => {
    // Extract the ID from the URL
    const id = url.split('/').pop();
    router.push(`/chat/${id}`);
  };

  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='w-full max-w-2xl px-4 py-8'>
        <header className='mb-8 text-center'>
          <h1 className='text-4xl font-extrabold text-foreground'>
            Smart PDF Vault App
          </h1>
          <p className='text-lg text-gray-400 mt-2'>
            Upload your PDF and start chatting with it!
          </p>
        </header>

        <main className='bg-gray-800 rounded-lg shadow-lg p-6'>
          <PdfUpload onUploadSuccess={handleUploadSuccess} />
        </main>

        <section className='mt-8 text-center'>
          <h2 className='text-2xl font-bold text-foreground'>How It Works</h2>
          <p className='text-gray-400 mt-2'>
            Simply upload your PDF document, and our application will process
            it. Once uploaded, you can start a chat session with the content of
            the PDF.
          </p>
        </section>

        <section className='mt-10 text-center'>
          <h2 className='text-3xl font-semibold text-foreground'>Features</h2>
          <ul className='mt-6 space-y-4'>
            <li className='flex items-center justify-center space-x-3'>
              <Plus className='w-6 h-6 text-primary' />
              <span className='text-lg text-gray-300'>Easy PDF Upload</span>
            </li>
            <li className='flex items-center justify-center space-x-3'>
              <Check className='w-6 h-6 text-primary' />
              <span className='text-lg text-gray-300'>
                Instant Chat with PDF Content
              </span>
            </li>
            <li className='flex items-center justify-center space-x-3'>
              <Eye className='w-6 h-6 text-primary' />
              <span className='text-lg text-gray-300'>Secure and Private</span>
            </li>
            <li className='flex items-center justify-center space-x-3'>
              <Languages className='w-6 h-6 text-primary' />
              <span className='text-lg text-gray-300'>
                Supports Multiple Languages
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
