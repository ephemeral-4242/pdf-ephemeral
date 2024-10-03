import React from 'react';
import {
  FileText,
  Loader2,
  Folder,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

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

const LibraryDisplaySideDrawer: React.FC<LibraryDisplaySideDrawerProps> = ({
  pdfs,
  isLoading,
  isOpen,
  onToggle,
}) => {
  return (
    <div
      className={`h-full bg-gray-900 transition-all duration-300 flex ${isOpen ? 'w-64' : 'w-12'}`}
    >
      <button
        onClick={onToggle}
        className='h-full bg-gray-800 px-2 flex items-center'
      >
        {isOpen ? (
          <ChevronRight className='text-white' />
        ) : (
          <ChevronLeft className='text-white' />
        )}
      </button>

      {isOpen && (
        <div className='flex-grow p-4 overflow-y-auto'>
          {isLoading ? (
            <div className='flex justify-center items-center h-32'>
              <Loader2 className='w-6 h-6 animate-spin text-white' />
            </div>
          ) : (
            <div className='space-y-2'>
              {pdfs.map((pdf: PDF, index: number) => (
                <div
                  key={pdf.id}
                  className='bg-gray-800 rounded-lg p-3 flex items-start cursor-pointer hover:bg-gray-700 transition-all duration-300 animate-fade-in-right'
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <FileText className='h-5 w-5 text-green-400 mr-3 mt-1' />
                  <div>
                    <h3 className='text-sm font-medium text-white'>
                      {pdf.fileName}
                    </h3>
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
          )}
        </div>
      )}
    </div>
  );
};

export default LibraryDisplaySideDrawer;
