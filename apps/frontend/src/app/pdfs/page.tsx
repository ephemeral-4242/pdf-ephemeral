'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../api/routes';
import {
  FileText,
  Folder as FolderIcon,
  MessageSquare,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  UploadCloud,
} from 'lucide-react';
import CreateFolderModal from '../../components/CreateFolderModal'; // Import the modal
import { Button } from '../../components/common/Button'; // Import the button
import { Folder } from '@/components/PdfUpload';

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
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false); // State for modal visibility
  const [folders, setFolders] = useState<Folder[]>([]); // State for folders

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
      <h1 className='text-3xl font-semibold mb-8'>Your PDF Library</h1>

      <Button
        type='button'
        onClick={() => setShowCreateFolderModal(true)}
        className='mb-8'
      >
        Create Folder
      </Button>

      {Object.keys(groupedPdfs).length === 0 ? (
        <div className='flex flex-col items-center justify-center py-16 bg-gray-800 rounded-lg'>
          <UploadCloud className='h-16 w-16 text-gray-400' />
          <p className='mt-4 text-xl font-medium text-gray-300'>
            No PDFs uploaded yet
          </p>
          <p className='mt-2 text-gray-400'>Get started by uploading a PDF.</p>
          <Link href='/' passHref>
            <button className='mt-6 px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md'>
              Upload a PDF
            </button>
          </Link>
        </div>
      ) : (
        <div className='space-y-8'>
          {Object.entries(groupedPdfs).map(([folderName, pdfs]) => (
            <div key={folderName}>
              <div
                className='flex items-center justify-between cursor-pointer'
                onClick={() => toggleFolder(folderName)}
              >
                <div className='flex items-center'>
                  {collapsedFolders[folderName] ? (
                    <ChevronRight className='h-5 w-5 text-gray-400' />
                  ) : (
                    <ChevronDown className='h-5 w-5 text-gray-400' />
                  )}
                  <FolderIcon className='h-6 w-6 text-yellow-400 ml-2' />
                  <h2 className='ml-3 text-lg font-medium text-gray-100'>
                    {folderName}
                  </h2>
                </div>
                <span className='text-sm text-gray-400'>
                  {pdfs.length} {pdfs.length > 1 ? 'files' : 'file'}
                </span>
              </div>
              {!collapsedFolders[folderName] && (
                <ul className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4'>
                  {pdfs.map((pdf) => (
                    <li key={pdf.id}>
                      <div className='group relative bg-gray-800 border border-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow'>
                        <div className='flex items-center'>
                          <FileText className='h-8 w-8 text-blue-400' />
                          <div className='ml-3'>
                            <p className='text-sm font-medium text-gray-100'>
                              {pdf.fileName}
                            </p>
                            <p className='text-xs text-gray-400'>
                              {new Date(pdf.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                          <div className='flex space-x-2'>
                            <Link href={`/chat/${pdf.id}`} passHref>
                              <button className='p-1 rounded-full text-gray-400 hover:bg-gray-700'>
                                <MessageSquare className='h-5 w-5' />
                              </button>
                            </Link>
                            <button className='p-1 rounded-full text-gray-400 hover:bg-gray-700'>
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

      <CreateFolderModal
        show={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onCreate={(newFolder: Folder) =>
          setFolders((prevFolders) => [...prevFolders, newFolder])
        }
      />
    </div>
  );
}
