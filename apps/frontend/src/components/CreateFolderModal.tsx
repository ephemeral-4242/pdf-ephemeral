import React, { useState } from 'react';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { api } from '../api/routes';
import { Folder } from './PdfUpload';
import { FiX } from 'react-icons/fi';

interface CreateFolderModalProps {
  show: boolean;
  onClose: () => void;
  onCreate: (newFolder: Folder) => void;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  show,
  onClose,
  onCreate,
}) => {
  const [folderName, setFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      setError('Folder name cannot be empty.');
      return;
    }
    setIsCreating(true);
    try {
      const newFolder = await api.pdf.createFolder(folderName.trim());
      onCreate(newFolder);
      setFolderName('');
      setError('');
      onClose();
    } catch (err) {
      console.error('Error creating folder:', err);
      setError('Failed to create folder. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!show) return null;

  return (
    <div className='fixed inset-0 flex items-center justify-center z-50 px-4 sm:px-0'>
      {/* Overlay */}
      <div
        className='fixed inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className='relative bg-gray-800 text-white rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all duration-300 ease-in-out'>
        {/* Close Button */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white rounded-full p-1'
        >
          <FiX className='w-6 h-6' />
        </button>

        <div className='px-8 py-10'>
          <h2 className='text-3xl font-bold mb-8 text-center text-white'>
            Create New Folder
          </h2>
          <div className='space-y-6'>
            <div>
              <label
                htmlFor='folderName'
                className='block text-sm font-medium text-gray-300 mb-2'
              >
                Folder Name
              </label>
              <Input
                id='folderName'
                type='text'
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder='Enter folder name'
                className='w-full bg-gray-700 border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'
              />
              {error && <p className='text-sm text-red-400 mt-2'>{error}</p>}
            </div>
            <div className='flex justify-end space-x-4'>
              <Button
                type='button'
                onClick={onClose}
                variant='outline'
                className='w-28 bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-700 focus:ring-gray-500'
              >
                Cancel
              </Button>
              <Button
                type='button'
                onClick={handleCreateFolder}
                disabled={isCreating}
                className='w-28 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFolderModal;
