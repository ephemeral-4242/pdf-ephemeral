'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../api/routes';
import { FileText, Calendar, MessageSquare, MoreVertical } from 'lucide-react';

interface PDF {
  id: string;
  name: string;
  uploadDate: string;
}

export default function PDFsPage() {
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

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500'></div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8 px-4'>
      <h1 className='text-3xl font-bold mb-8 text-gray-800'>
        Your PDF Library
      </h1>
      {pdfs.length === 0 ? (
        <div className='text-center py-16 bg-gray-50 rounded-lg'>
          <FileText className='mx-auto h-12 w-12 text-gray-400' />
          <p className='mt-2 text-sm font-medium text-gray-900'>
            No PDFs uploaded yet
          </p>
          <p className='mt-1 text-sm text-gray-500'>
            Get started by uploading a PDF
          </p>
          <Link
            href='/'
            className='mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
          >
            Upload a PDF
          </Link>
        </div>
      ) : (
        <div className='bg-white shadow overflow-hidden sm:rounded-md'>
          <ul className='divide-y divide-gray-200'>
            {pdfs.map((pdf) => (
              <li key={pdf.id}>
                <div className='px-4 py-4 sm:px-6 hover:bg-gray-50 transition duration-150 ease-in-out'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0'>
                        <FileText className='h-8 w-8 text-purple-500' />
                      </div>
                      <div className='ml-4'>
                        <div className='text-sm font-medium text-gray-900'>
                          {pdf.name}
                        </div>
                        <div className='text-xs text-gray-500'>
                          Uploaded: {new Date(pdf.uploadDate).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <Link
                        href={`/chat/${pdf.id}`}
                        className='text-purple-600 hover:text-purple-900'
                      >
                        <MessageSquare className='h-5 w-5' />
                      </Link>
                      <button className='text-gray-400 hover:text-gray-500'>
                        <MoreVertical className='h-5 w-5' />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
