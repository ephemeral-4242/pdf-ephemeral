import React, { useEffect, useState } from 'react';
import {
  FileText,
  Loader2,
  Folder,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Button } from './common/Button';

interface PDF {
  id: string;
  fileName: string;
  folder?: {
    id: string;
    name: string;
  };
}

interface LibraryDisplaySideDrawerProps {
  pdfs: PDF[];
  isLoading: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

const PDFCard: React.FC<{ pdf: PDF; show: boolean }> = ({ pdf, show }) => (
  <div
    className={`bg-gray-800 rounded-lg p-3 flex items-start cursor-pointer hover:bg-gray-700 transition-all duration-300 ${
      show ? 'animate-slide-in-right' : 'opacity-0 translate-x-full'
    }`}
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
);

const LibraryDisplaySideDrawer: React.FC<LibraryDisplaySideDrawerProps> = ({
  pdfs,
  isLoading,
  isOpen,
  onToggle,
}) => {
  const [visibleCards, setVisibleCards] = useState<number>(0);

  useEffect(() => {
    if (isOpen && !isLoading) {
      const interval = setInterval(() => {
        setVisibleCards((prev) => {
          if (prev < pdfs.length) {
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      setVisibleCards(0);
    }
  }, [isOpen, isLoading, pdfs.length]);

  return (
    <div
      className={`h-full bg-gray-900 transition-all duration-300 relative ${
        isOpen ? 'w-80' : 'w-12'
      }`}
    >
      <Button
        onClick={onToggle}
        variant='ghost'
        size='icon'
        className='absolute top-2 left-2 p-1'
      >
        {isOpen ? (
          <ChevronRight className='h-4 w-4' />
        ) : (
          <ChevronLeft className='h-4 w-4' />
        )}
      </Button>

      {isOpen && (
        <div className='pt-12 p-4 h-full overflow-y-auto'>
          {isLoading ? (
            <div className='flex justify-center items-center h-32'>
              <Loader2 className='w-6 h-6 animate-spin text-white' />
            </div>
          ) : (
            <div className='space-y-2 overflow-hidden'>
              {pdfs.map((pdf: PDF, index: number) => (
                <PDFCard key={pdf.id} pdf={pdf} show={index < visibleCards} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LibraryDisplaySideDrawer;
