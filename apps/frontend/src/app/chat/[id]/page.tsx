'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import PdfChat from '@/components/PdfChat';
import PDFViewer from '@/components/PDFViewer';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      setLoading(true);
      // Query the new endpoint to retrieve the PDF by its ID
      const url = `http://localhost:4000/pdf/${params.id}`;
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to load PDF');
          }
          return response.json();
        })
        .then((data) => {
          console.log('data', data);
          setPdfUrl(`http://localhost:4000/${data.filePath}`);
          setError(null);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  return (
    <div className='min-h-screen bg-background'>
      <div className='w-full px-2 sm:px-4 py-4'>
        <nav aria-label='breadcrumb'>
          <ol className='breadcrumb'>
            <li className='breadcrumb-item active' aria-current='page'></li>
          </ol>
        </nav>

        <div className='flex flex-col md:flex-row gap-4 h-[calc(109vh-8rem)]'>
          <div className='w-full md:w-1/2 bg-gray-800 rounded-lg shadow-md overflow-hidden'>
            <div className='h-full'>
              <PdfChat pdfId={params.id as string} />
            </div>
          </div>
          <div className='w-full md:w-1/2 bg-gray-800 rounded-lg shadow-md overflow-hidden'>
            {loading ? (
              <div className='flex justify-center items-center h-full'>
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className='flex justify-center items-center h-full text-red-500'>
                {error}
              </div>
            ) : (
              pdfUrl && (
                <div className='h-full overflow-y-auto'>
                  <PDFViewer url={pdfUrl} />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
