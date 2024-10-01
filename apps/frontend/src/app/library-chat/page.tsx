'use client';

import { useState, useEffect } from 'react';
import PdfChat from '@/components/PdfChat';
import { api } from '@/api/routes';
import { FileText, Loader2, Book } from 'lucide-react';

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
    <div className='flex h-screen bg-gray-900 text-white'>
      <div className='w-1/4 bg-gray-800 p-4 overflow-y-auto'>
        <h2 className='text-xl font-semibold mb-4 flex items-center'>
          <Book className='mr-2 h-5 w-5' /> Your Library
        </h2>
        {isLoading ? (
          <div className='flex justify-center items-center h-32'>
            <Loader2 className='w-6 h-6 animate-spin' />
          </div>
        ) : (
          <div className='space-y-2'>
            {pdfs.map((pdf) => (
              <div
                key={pdf.id}
                className='bg-gray-700 p-2 rounded-md hover:bg-gray-600 transition-colors duration-200'
              >
                <div className='flex items-center'>
                  <FileText className='h-4 w-4 text-blue-400 mr-2' />
                  <div className='flex-1 min-w-0'>
                    <h3 className='text-sm font-medium truncate'>{pdf.name}</h3>
                    <p className='text-xs text-gray-400'>In library</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className='flex-1 flex flex-col'>
        <div className='p-6 bg-gray-800'>
          <h1 className='text-3xl font-bold'>Library Chat</h1>
          <p className='text-gray-400 mt-2'>
            Ask questions about all PDFs in your library
          </p>
        </div>
        <div className='flex-1 overflow-hidden'>
          <PdfChat pdfId='library' />
        </div>
      </div>
    </div>
  );
}
