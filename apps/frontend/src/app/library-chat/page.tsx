'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PdfChat from '@/components/PdfChat';
import { api } from '@/api/routes';
import { FileText, Loader2, Book, Folder } from 'lucide-react';

interface PDF {
  id: string;
  fileName: string;
  folder?: {
    id: string;
    name: string;
  };
}

interface LibraryDisplayProps {
  pdfs: PDF[];
  isLoading: boolean;
}

const LibraryDisplay: React.FC<LibraryDisplayProps> = ({ pdfs, isLoading }) => {
  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-32'>
        <Loader2 className='w-6 h-6 animate-spin text-white' />
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      {pdfs.map((pdf, index) => (
        <div
          key={pdf.id}
          className='bg-gray-800 rounded-lg p-3 flex items-start cursor-pointer hover:bg-gray-700 transition-all duration-300 animate-fade-in-right'
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <FileText className='h-5 w-5 text-green-400 mr-3 mt-1' />
          <div>
            <h3 className='text-sm font-medium text-white'>{pdf.fileName}</h3>
            {pdf.folder && (
              <div className='flex items-center mt-1 text-xs text-gray-400'>
                <Folder className='h-3 w-3 mr-1' />
                {pdf.folder.name}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function LibraryChatPage() {
  const [allPdfs, setAllPdfs] = useState<PDF[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfIdsToRender, setPdfIdsToRender] = useState<string[]>([]);

  const searchParams = useSearchParams();
  const initialQuestion = searchParams.get('question') || '';

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const fetchedPdfs = await api.pdf.getAll();
        setAllPdfs(fetchedPdfs);
      } catch (error) {
        console.error('Error fetching PDFs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPdfs();
  }, []);

  const pdfsToRender = allPdfs.filter((pdf) => pdfIdsToRender.includes(pdf.id));

  const handlePdfRendering = (id: string) => {
    setPdfIdsToRender((prevIds) => {
      if (prevIds.includes(id)) {
        // If the ID is already in the array, remove it
        return prevIds.filter((prevId) => prevId !== id);
      } else {
        // If the ID is not in the array, add it
        return [...prevIds, id];
      }
    });
  };

  return (
    <div className='flex h-full'>
      {/* Main content area with PdfChat */}
      <div className='flex-1 flex flex-col'>
        <PdfChat
          pdfId='library'
          initialQuestion={initialQuestion}
          onPdfChunkReceived={handlePdfRendering}
        />
      </div>

      {/* Sidebar on the right with matching background color */}
      <div className='w-80 bg-gray-900 p-4 overflow-y-auto'>
        <h2 className='text-xl font-semibold mb-4 flex items-center text-white'>
          <Book className='mr-2 h-5 w-5' /> Your Library
        </h2>

        <LibraryDisplay pdfs={pdfsToRender} isLoading={isLoading} />
      </div>
    </div>
  );
}
