'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import PdfUpload from '../../components/PdfUpload';
import { Folder } from '@/components/PdfUpload';
import { useModals } from '@/hooks/useModals';
import { PDF, usePDFs } from '@/hooks/usePDFs';
import EnhancedUpload from '@/components/EnhancedUpload';

interface HeaderProps {
  onNewFolder: () => void;
  onUploadPDF: () => void;
}

interface FolderItemProps {
  folderName: string;
  pdfs: PDF[];
  isExpanded: boolean;
  onToggle: () => void;
}

interface PDFItemProps {
  pdf: PDF;
}

interface UploadModalProps {
  onClose: () => void;
  onUploadSuccess: (urls: string[]) => void;
}

const PDFComponents = {
  Header: ({ onNewFolder, onUploadPDF }: HeaderProps) => (
    <div className='flex justify-between items-center mb-6'>
      <h1 className='text-2xl font-semibold'>Your PDF Library</h1>
      <div className='flex space-x-2'>
        <button
          className='px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md flex items-center'
          onClick={onNewFolder}
        >
          <FolderIcon className='h-4 w-4 mr-2' />
          New Folder
        </button>
        <button
          className='px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md flex items-center'
          onClick={onUploadPDF}
        >
          <UploadCloud className='h-4 w-4 mr-2' />
          Upload PDF
        </button>
      </div>
    </div>
  ),

  EmptyState: () => (
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
  ),

  FolderItem: ({ folderName, pdfs, isExpanded, onToggle }: FolderItemProps) => (
    <div className='bg-gray-800 rounded overflow-hidden'>
      <div
        className='flex items-center justify-between cursor-pointer py-2 px-4 hover:bg-gray-700'
        onClick={onToggle}
      >
        <div className='flex items-center'>
          {isExpanded ? (
            <ChevronDown className='h-4 w-4 text-gray-400' />
          ) : (
            <ChevronRight className='h-4 w-4 text-gray-400' />
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
      {isExpanded && (
        <div className='border-t border-gray-700'>
          {pdfs.map((pdf) => (
            <PDFComponents.PDFItem key={pdf.id} pdf={pdf} />
          ))}
        </div>
      )}
    </div>
  ),

  PDFItem: ({ pdf }: PDFItemProps) => (
    <div className='flex items-center justify-between py-2 px-4 hover:bg-gray-700'>
      <div className='flex items-center'>
        <FileText className='h-4 w-4 text-blue-400' />
        <div className='ml-2'>
          <p className='text-sm font-medium text-gray-100'>{pdf.fileName}</p>
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
  ),

  UploadModal: ({ onClose, onUploadSuccess }: UploadModalProps) => (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
      <div className='bg-gray-800 p-6 rounded-lg shadow-lg relative'>
        <button
          className='absolute top-2 right-2 text-gray-500 hover:text-gray-700'
          onClick={onClose}
        >
          &times;
        </button>
        <EnhancedUpload onUploadSuccess={onUploadSuccess} />
      </div>
    </div>
  ),
};

export default function PDFsPage() {
  const { pdfs, setPdfs, isLoading, groupedPdfs } = usePDFs();
  const { showCreateFolderModal, showUploadModal, toggleModal } = useModals();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [folders, setFolders] = useState<Folder[]>([]);
  const router = useRouter();

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderName)) {
        next.delete(folderName);
      } else {
        next.add(folderName);
      }
      return next;
    });
  };

  const handleUploadSuccess = (urls: string[]) => {
    console.log('Upload successful:', urls);
    toggleModal('upload');
    if (urls.length > 0) {
      const id = urls[0].split('/').pop();
      router.push(`/chat/${id}`);
    }
    // Optionally, you might want to refresh your PDF list here
    // For example: refetchPDFs();
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen bg-gray-900'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500'></div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8 px-4 bg-gray-900 text-gray-100'>
      <PDFComponents.Header
        onNewFolder={() => toggleModal('folder')}
        onUploadPDF={() => toggleModal('upload')}
      />

      {Object.keys(groupedPdfs).length === 0 ? (
        <PDFComponents.EmptyState />
      ) : (
        <div className='space-y-1'>
          {Object.entries(groupedPdfs).map(([folderName, pdfs]) => (
            <PDFComponents.FolderItem
              key={folderName}
              folderName={folderName}
              pdfs={pdfs}
              isExpanded={expandedFolders.has(folderName)}
              onToggle={() => toggleFolder(folderName)}
            />
          ))}
        </div>
      )}

      <CreateFolderModal
        show={showCreateFolderModal}
        onClose={() => toggleModal('folder')}
        onCreate={(newFolder: Folder) =>
          setFolders((prevFolders) => [...prevFolders, newFolder])
        }
      />

      {showUploadModal && (
        <PDFComponents.UploadModal
          onClose={() => toggleModal('upload')}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
