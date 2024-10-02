'use client';

import { useState, useEffect } from 'react';
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
      const folderName = pdf.folder?.name || 'Uncategorized';
      if (!acc[folderName]) {
        acc[folderName] = [];
      }
      acc[folderName].push(pdf);
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

  return (
    <div className='flex h-full'>
      {/* Main content area with PdfChat */}
      <div className='flex-1 flex flex-col'>
        <PdfChat pdfId='library' />
      </div>

      {/* Sidebar on the right */}
      <div className='w-64 bg-gray-800 p-4 overflow-y-auto'>
        <h2 className='text-xl font-semibold mb-4 flex items-center text-white'>
          <Book className='mr-2 h-5 w-5' /> Your Library
        </h2>
        {isLoading ? (
          <div className='flex justify-center items-center h-32'>
            <Loader2 className='w-6 h-6 animate-spin text-white' />
          </div>
        ) : (
          <div className='space-y-2'>
            {Object.keys(folders).map((folderName) => (
              <div key={folderName} className='mb-2'>
                <div
                  className='flex items-center cursor-pointer hover:text-blue-400 text-white'
                  onClick={() => toggleFolder(folderName)}
                >
                  {expandedFolders[folderName] ? (
                    <ChevronDown className='h-4 w-4 mr-1' />
                  ) : (
                    <ChevronRight className='h-4 w-4 mr-1' />
                  )}
                  <FolderIcon className='h-4 w-4 mr-2' />
                  <span className='font-medium'>{folderName}</span>
                </div>
                {expandedFolders[folderName] && (
                  <div className='ml-6 mt-2 space-y-1'>
                    {folders[folderName].map((pdf) => (
                      <div
                        key={pdf.id}
                        className='flex items-center p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors duration-200 cursor-pointer'
                      >
                        <FileText className='h-5 w-5 text-blue-400 mr-3' />
                        <h3 className='text-sm font-medium truncate text-white'>
                          {pdf.fileName}
                        </h3>
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
