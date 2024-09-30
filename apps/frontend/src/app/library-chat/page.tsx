'use client';

import { useState, useEffect } from 'react';
import PdfChat from '@/components/PdfChat';
import { api } from '@/api/routes';
import { FileText } from 'lucide-react';

interface PDF {
  id: string;
  name: string;
}

export default function LibraryChatPage() {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const fetchedPdfs = await api.pdf.getAll();
        setPdfs(fetchedPdfs);
      } catch (error) {
        console.error('Error fetching PDFs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPdfs();
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='w-full px-2 sm:px-4 py-4'>
        <div className='flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow-md'>
          <h1 className='text-2xl font-bold text-gray-900'>Library Chat</h1>
        </div>

        {isLoading ? (
          <div className='flex justify-center items-center h-screen'>
            <div className='animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500'></div>
          </div>
        ) : (
          <div className='flex flex-col md:flex-row gap-4 h-[calc(100vh-8rem)]'>
            <div className='w-full md:w-1/2 bg-white rounded-lg shadow-md overflow-hidden'>
              <div className='h-full overflow-y-auto p-4'>
                <h2 className='text-xl font-semibold text-gray-800 mb-4'>
                  Your PDFs
                </h2>
                <ul className='divide-y divide-gray-200'>
                  {pdfs.map((pdf) => (
                    <li key={pdf.id} className='py-2 flex items-center'>
                      <FileText className='h-6 w-6 text-purple-500 mr-2' />
                      <span className='text-gray-700'>{pdf.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className='w-full md:w-1/2 bg-white rounded-lg shadow-md overflow-hidden'>
              <div className='h-full overflow-y-auto'>
                <PdfChat pdfId='library' />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
