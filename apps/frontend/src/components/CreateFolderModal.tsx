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
    <div className='fixed inset-0 flex items-center justify-center z-50'>
      {/* Overlay */}
      <div
        className='absolute inset-0 bg-black opacity-50'
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className='relative bg-gray-900 text-white rounded-lg shadow-lg w-11/12 max-w-md mx-auto'>
        {/* Close Button */}
        <button
          onClick={onClose}
          className='absolute top-3 right-3 text-gray-400 hover:text-white transition-colors duration-200'
        >
          <FiX className='w-5 h-5' />
        </button>

        <div className='px-6 py-8'>
          <h2 className='text-2xl font-semibold mb-6 text-center'>
            Create New Folder
          </h2>
          <div>
            <label
              htmlFor='folderName'
              className='block text-sm font-medium text-gray-200 mb-2'
            >
              Folder Name
            </label>
            <Input
              id='folderName'
              type='text'
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder='Enter folder name'
              className='w-full'
            />
            {error && <p className='text-sm text-red-500 mt-2'>{error}</p>}
          </div>
          <div className='flex justify-end mt-8 space-x-3'>
            <Button
              type='button'
              onClick={onClose}
              variant='outline'
              className='w-24'
            >
              Cancel
            </Button>
            <Button
              type='button'
              onClick={handleCreateFolder}
              disabled={isCreating}
              className='w-24'
            >
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFolderModal;
