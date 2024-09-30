'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../api/routes';

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
    return <div className='text-center py-8'>Loading...</div>;
  }

  return (
    <div className='container mx-auto py-8'>
      <h1 className='text-3xl font-bold mb-6'>Saved PDFs</h1>
      {pdfs.length === 0 ? (
        <p>No PDFs uploaded yet.</p>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {pdfs.map((pdf) => (
            <div key={pdf.id} className='border border-gray-200 rounded-lg p-4'>
              <h3 className='text-lg font-semibold'>{pdf.name}</h3>
              <p className='text-sm text-gray-500'>
                Uploaded: {new Date(pdf.uploadDate).toLocaleString()}
              </p>
              <Link
                href={`/chat/${pdf.id}`}
                className='text-blue-500 hover:underline mt-2 inline-block'
              >
                Chat with this PDF
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
