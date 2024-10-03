'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PdfChat from '@/components/PdfChat';
import { api } from '@/api/routes';
import {
  FileText,
  Loader2,
  Book,
  Folder as FolderIcon,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface PDF {
  id: string;
  fileName: string;
  folder?: {
    id: string;
    name: string;
  };
}

export default function LibraryChatPage() {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<{
    [key: string]: boolean;
  }>({});
  const [pdfIdsToRender, setPdfIdsToRender] = useState<string[]>([]);

  const searchParams = useSearchParams();
  const initialQuestion = searchParams.get('question') || '';

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

  // Group PDFs by folders
  const folders = pdfs.reduce(
    (acc, pdf) => {
      if (pdfIdsToRender.includes(pdf.id)) {
        const folderName = pdf.folder?.name || 'Uncategorized';
        if (!acc[folderName]) {
          acc[folderName] = [];
        }
        acc[folderName].push(pdf);
      }
      return acc;
    },
    {} as { [key: string]: PDF[] }
  );

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

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

        {isLoading ? (
          <div className='flex justify-center items-center h-32'>
            <Loader2 className='w-6 h-6 animate-spin text-white' />
          </div>
        ) : (
          <div className='space-y-4'>
            {Object.keys(folders).map((folderName, index) => (
              <div
                key={folderName}
                className='animate-fade-in-down'
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Folder Card */}
                <div
                  className='bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-all duration-300'
                  onClick={() => toggleFolder(folderName)}
                >
                  <div className='flex items-center'>
                    <FolderIcon className='h-5 w-5 mr-3 text-blue-400' />
                    <span className='text-lg font-medium text-white'>
                      {folderName}
                    </span>
                    <div className='ml-auto'>
                      {expandedFolders[folderName] ? (
                        <ChevronDown className='h-5 w-5 text-white' />
                      ) : (
                        <ChevronRight className='h-5 w-5 text-white' />
                      )}
                    </div>
                  </div>
                </div>
                {/* Files inside the folder */}
                {expandedFolders[folderName] && (
                  <div className='mt-2 space-y-2'>
                    {folders[folderName].map((pdf, fileIndex) => (
                      <div
                        key={pdf.id}
                        className='bg-gray-800 rounded-lg p-3 flex items-center cursor-pointer hover:bg-gray-700 transition-all duration-300 animate-fade-in-right'
                        style={{ animationDelay: `${fileIndex * 50}ms` }}
                      >
                        <FileText className='h-5 w-5 text-green-400 mr-3' />
                        <div>
                          <h3 className='text-sm font-medium text-white'>
                            {pdf.fileName}
                          </h3>
                          {/* Additional file info can be added here */}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
