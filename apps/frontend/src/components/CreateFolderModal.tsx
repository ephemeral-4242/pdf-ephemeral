import React, { useState } from 'react';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { api } from '../api/routes';
import { Folder } from './PdfUpload';

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

  const handleCreateFolder = async () => {
    setIsCreating(true);
    try {
      const newFolder = await api.pdf.createFolder(folderName);
      onCreate(newFolder);
      setFolderName('');
      onClose();
    } catch (error) {
      console.error('Error creating folder:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!show) return null;

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white p-4 rounded-lg shadow-lg'>
        <h2 className='text-lg font-bold mb-4'>Create New Folder</h2>
        <Input
          type='text'
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder='Folder Name'
          className='mb-4'
        />
        <div className='flex justify-end space-x-2'>
          <Button onClick={onClose} variant='outline'>
            Cancel
          </Button>
          <Button
            onClick={handleCreateFolder}
            disabled={isCreating || !folderName}
          >
            {isCreating ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateFolderModal;
