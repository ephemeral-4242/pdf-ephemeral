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
  Search,
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
  const [searchQuery, setSearchQuery] = useState('');

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
        <PdfChat pdfId='library' initialQuestion={initialQuestion} />
      </div>

      {/* Sidebar on the right with matching background color */}
      <div className='w-80 bg-gray-900 p-4 overflow-y-auto'>
        <h2 className='text-xl font-semibold mb-4 flex items-center text-white'>
          <Book className='mr-2 h-5 w-5' /> Your Library
        </h2>

        {/* Search Bar */}
        <div className='mb-4'>
          <div className='flex items-center bg-gray-800 rounded-lg p-2'>
            <Search className='h-5 w-5 text-gray-400' />
            <input
              type='text'
              placeholder='Search...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='ml-2 bg-transparent focus:outline-none text-white w-full'
            />
          </div>
        </div>

        {isLoading ? (
          <div className='flex justify-center items-center h-32'>
            <Loader2 className='w-6 h-6 animate-spin text-white' />
          </div>
        ) : (
          <div className='space-y-4'>
            {Object.keys(folders)
              .filter(
                (folderName) =>
                  folderName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  folders[folderName].some((pdf) =>
                    pdf.fileName
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  )
              )
              .map((folderName) => (
                <div key={folderName}>
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
                      {folders[folderName]
                        .filter((pdf) =>
                          pdf.fileName
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        )
                        .map((pdf) => (
                          <div
                            key={pdf.id}
                            className='bg-gray-800 rounded-lg p-3 flex items-center cursor-pointer hover:bg-gray-700 transition-all duration-300'
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
