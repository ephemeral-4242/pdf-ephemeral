import { useState } from 'react';
import { api } from '../api/routes';
import { FileTreeNode } from '../components/FileTree';

export const useEnhancedUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFiles = async (
    fileTree: FileTreeNode[],
    folderId: string
  ): Promise<string[]> => {
    setIsUploading(true);
    const formData = new FormData();
    const paths: string[] = [];

    const addToFormData = (node: FileTreeNode, path: string) => {
      if (node.file) {
        formData.append('files', node.file);
        paths.push(path);
      }
      node.children.forEach((child) =>
        addToFormData(child, `${path}/${child.name}`)
      );
    };

    fileTree.forEach((node) => addToFormData(node, node.name));

    paths.forEach((path) => formData.append('paths', path));

    // Append folderId to formData
    formData.append('folderId', folderId);

    try {
      const result = await api.pdf.uploadEnhanced(formData);
      setIsUploading(false);
      return result.urls;
    } catch (error) {
      console.error('Error uploading files:', error);
      setIsUploading(false);
      throw error;
    }
  };

  return { uploadFiles, isUploading };
};
