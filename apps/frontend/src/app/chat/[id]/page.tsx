'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import PdfChat from '@/components/PdfChat';
import PDFViewer from '@/components/PDFViewer';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      // Construct the PDF URL using the id
      setPdfUrl(`http://localhost:4000/uploads/${params.id}`);
    }
  }, [params.id]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='w-full px-2 sm:px-4 py-4'>
        <div className='flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow-md'>
          <h1 className='text-2xl font-bold text-gray-900'>PDF Chat</h1>
          <Link
            href='/'
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
          >
            Add New PDF
          </Link>
        </div>

        <div className='flex flex-col md:flex-row gap-4 h-[calc(100vh-8rem)]'>
          <div className='w-full md:w-1/2 bg-white rounded-lg shadow-md overflow-hidden'>
            {pdfUrl && (
              <div className='h-full overflow-y-auto'>
                <PDFViewer url={pdfUrl} />
              </div>
            )}
          </div>
          <div className='w-full md:w-1/2 bg-white rounded-lg shadow-md overflow-hidden'>
            <div className='h-full overflow-y-auto'>
              <PdfChat pdfId={params.id as string} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
