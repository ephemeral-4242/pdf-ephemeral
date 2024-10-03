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
import CreateFolderModal from '../../components/CreateFolderModal';
import { Button } from '../../components/common/Button';
import PdfUpload from '../../components/PdfUpload'; // Import PdfUpload
import { Folder } from '@/components/PdfUpload';
import { useRouter } from 'next/navigation';

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
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false); // State for upload modal visibility
  const [folders, setFolders] = useState<Folder[]>([]);

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
  const router = useRouter();

  const handleUploadSuccess = (url: string) => {
    // Handle successful upload, e.g., refresh the list of PDFs
    console.log('Upload successful:', url);
    setShowUploadModal(false);
    const id = url.split('/').pop();
    router.push(`/chat/${id}`);
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
    <div className='container mx-auto py-8 px-4 bg-gray-900 text-gray-100'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-semibold'>Your PDF Library</h1>
        <div className='flex space-x-2'>
          <button
            className='px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md flex items-center'
            onClick={() => setShowCreateFolderModal(true)}
          >
            <FolderIcon className='h-4 w-4 mr-2' />
            New Folder
          </button>
          <button
            className='px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md flex items-center'
            onClick={() => setShowUploadModal(true)}
          >
            <UploadCloud className='h-4 w-4 mr-2' />
            Upload PDF
          </button>
        </div>
      </div>

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
        <div className='space-y-1'>
          {Object.entries(groupedPdfs).map(([folderName, pdfs]) => (
            <div
              key={folderName}
              className='bg-gray-800 rounded overflow-hidden'
            >
              <div
                className='flex items-center justify-between cursor-pointer py-2 px-4 hover:bg-gray-700'
                onClick={() => toggleFolder(folderName)}
              >
                <div className='flex items-center'>
                  {collapsedFolders[folderName] ? (
                    <ChevronRight className='h-4 w-4 text-gray-400' />
                  ) : (
                    <ChevronDown className='h-4 w-4 text-gray-400' />
                  )}
                  <FolderIcon className='h-5 w-5 text-yellow-400 ml-2' />
                  <h2 className='ml-2 text-sm font-medium text-gray-100'>
                    {folderName}
                  </h2>
                </div>
                <span className='text-xs text-gray-400'>
                  {pdfs.length} {pdfs.length > 1 ? 'files' : 'file'}
                </span>
              </div>
              {!collapsedFolders[folderName] && (
                <div className='border-t border-gray-700'>
                  {pdfs.map((pdf) => (
                    <div
                      key={pdf.id}
                      className='flex items-center justify-between py-2 px-4 hover:bg-gray-700'
                    >
                      <div className='flex items-center'>
                        <FileText className='h-4 w-4 text-blue-400' />
                        <div className='ml-2'>
                          <p className='text-sm font-medium text-gray-100'>
                            {pdf.fileName}
                          </p>
                          <p className='text-xs text-gray-400'>
                            {new Date(pdf.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className='flex space-x-2'>
                        <Link href={`/chat/${pdf.id}`} passHref>
                          <button className='p-1 rounded-full text-gray-400 hover:bg-gray-600'>
                            <MessageSquare className='h-4 w-4' />
                          </button>
                        </Link>
                        <button className='p-1 rounded-full text-gray-400 hover:bg-gray-600'>
                          <MoreVertical className='h-4 w-4' />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}

const UploadModal: React.FC<{
  onClose: () => void;
  onUploadSuccess: (url: string) => void;
}> = ({ onClose, onUploadSuccess }) => {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
      <div className='bg-gray-800 p-6 rounded-lg shadow-lg relative'>
        <button
          className='absolute top-2 right-2 text-gray-500 hover:text-gray-700'
          onClick={onClose}
        >
          &times;
        </button>
        <PdfUpload onUploadSuccess={onUploadSuccess} />
      </div>
    </div>
  );
};
