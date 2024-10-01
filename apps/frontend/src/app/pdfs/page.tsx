'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../api/routes';
import {
  FileText,
  Folder,
  MessageSquare,
  MoreVertical,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface PDF {
  id: string;
  fileName: string;
  uploadDate: string;
  folder?: {
    id: string;
    name: string;
  };
}

export default function PDFsPage() {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [collapsedFolders, setCollapsedFolders] = useState<
    Record<string, boolean>
  >({});

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

  const toggleFolder = (folderName: string) => {
    setCollapsedFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen bg-gray-900'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500'></div>
      </div>
    );
  }

  const groupedPdfs = pdfs.reduce(
    (acc, pdf) => {
      const folderName = pdf.folder ? pdf.folder.name : 'Root';
      if (!acc[folderName]) {
        acc[folderName] = [];
      }
      acc[folderName].push(pdf);
      return acc;
    },
    {} as Record<string, PDF[]>
  );

  return (
    <div className='container mx-auto py-12 px-6 bg-gray-900 text-gray-100'>
      <h1 className='text-4xl font-bold mb-10 text-gray-100'>
        Your PDF Library
      </h1>
      {Object.keys(groupedPdfs).length === 0 ? (
        <div className='text-center py-16 bg-gray-800 rounded-lg shadow'>
          <FileText className='mx-auto h-12 w-12 text-gray-400' />
          <p className='mt-2 text-lg font-medium text-gray-200'>
            No PDFs uploaded yet
          </p>
          <p className='mt-1 text-sm text-gray-400'>
            Get started by uploading a PDF.
          </p>
          <Link href='/' passHref>
            <button className='mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-gray-900 bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
              Upload a PDF
            </button>
          </Link>
        </div>
      ) : (
        <div className='bg-gray-800 shadow overflow-hidden sm:rounded-md'>
          {Object.entries(groupedPdfs).map(([folderName, pdfs]) => (
            <div key={folderName} className='mb-6'>
              <div
                className='flex items-center justify-between px-4 py-3 bg-gray-700 hover:bg-gray-600 cursor-pointer rounded-md'
                onClick={() => toggleFolder(folderName)}
              >
                <div className='flex items-center'>
                  {collapsedFolders[folderName] ? (
                    <ChevronRight className='h-5 w-5 text-gray-300' />
                  ) : (
                    <ChevronDown className='h-5 w-5 text-gray-300' />
                  )}
                  <Folder className='h-6 w-6 text-blue-400 ml-2' />
                  <h2 className='ml-3 text-lg font-semibold text-gray-200'>
                    {folderName}
                  </h2>
                </div>
                <span className='text-sm text-gray-400'>
                  {pdfs.length} {pdfs.length > 1 ? 'files' : 'file'}
                </span>
              </div>
              {!collapsedFolders[folderName] && (
                <ul className='divide-y divide-gray-700'>
                  {pdfs.map((pdf) => (
                    <li key={pdf.id}>
                      <div className='px-4 py-4 sm:px-6 hover:bg-gray-700 transition duration-150 ease-in-out'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center'>
                            <FileText className='h-8 w-8 text-blue-400' />
                            <div className='ml-4'>
                              <div className='text-sm font-medium text-gray-200'>
                                {pdf.fileName}
                              </div>
                              <div className='text-sm text-gray-400'>
                                Uploaded:{' '}
                                {new Date(pdf.uploadDate).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className='flex items-center space-x-4'>
                            <Link href={`/chat/${pdf.id}`} passHref>
                              <button className='text-blue-400 hover:text-blue-300'>
                                <MessageSquare className='h-5 w-5' />
                              </button>
                            </Link>
                            <button className='text-gray-400 hover:text-gray-300'>
                              <MoreVertical className='h-5 w-5' />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
