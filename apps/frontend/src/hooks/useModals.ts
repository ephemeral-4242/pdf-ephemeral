import { useState } from 'react';

export const useModals = () => {
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const toggleModal = (modal: 'folder' | 'upload') => {
    if (modal === 'folder') setShowCreateFolderModal((prev) => !prev);
    if (modal === 'upload') setShowUploadModal((prev) => !prev);
  };

  return { showCreateFolderModal, showUploadModal, toggleModal };
};
