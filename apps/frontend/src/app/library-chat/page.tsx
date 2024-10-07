'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PdfChat from '@/components/PdfChat';

import { api } from '@/api/routes';
import LibraryDisplaySideDrawer from '@/components/LibraryDisplaySideDrawer';

interface PDF {
  id: string;
  fileName: string;
  folder?: {
    id: string;
    name: string;
  };
}

export default function LibraryChatPage() {
  const [allPdfs, setAllPdfs] = useState<PDF[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfIdsToRender, setPdfIdsToRender] = useState<string[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
      if (!prevIds.includes(id)) {
        setIsDrawerOpen(true);
        return [...prevIds, id];
      }
      return prevIds;
    });
  };

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  return (
    <div className='flex h-full'>
      {/* Main content area with PdfChat */}
      <div className='flex-grow'>
        <PdfChat
          pdfId='library'
          initialQuestion={initialQuestion}
          onPdfChunkReceived={handlePdfRendering}
        />
      </div>

      {/* Sidebar with LibraryDisplaySideDrawer */}
      <LibraryDisplaySideDrawer
        pdfs={pdfsToRender}
        isLoading={isLoading}
        isOpen={isDrawerOpen}
        onToggle={toggleDrawer}
      />
    </div>
  );
}
