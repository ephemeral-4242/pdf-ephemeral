'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface PDF {
  id: string;
  name: string;
}

export default function PDFsPage() {
  const [pdfs, setPdfs] = useState<PDF[]>([]);

  useEffect(() => {
    // For now, we'll use mock data
    const mockPdfs: PDF[] = [
      { id: '1', name: 'Sample PDF 1' },
      { id: '2', name: 'Sample PDF 2' },
      { id: '3', name: 'Sample PDF 3' },
    ];
    setPdfs(mockPdfs);
  }, []);

  return (
    <div className='container mx-auto py-8'>
      <h1 className='text-3xl font-bold mb-6'>Saved PDFs</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {pdfs.map((pdf) => (
          <div key={pdf.id} className='border border-gray-200 rounded-lg p-4'>
            <h3 className='text-lg font-semibold'>{pdf.name}</h3>
            <Link href={`/`} className='text-blue-500 hover:underline'>
              View PDF
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
