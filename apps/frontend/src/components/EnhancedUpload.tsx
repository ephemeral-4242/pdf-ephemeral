import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import { FileTree, FileTreeNode } from './FileTree';
import { useEnhancedUpload } from '@/hooks/useEnhancedUpload';

interface EnhancedUploadProps {
  onUploadSuccess: (urls: string[]) => void;
}

const EnhancedUpload: React.FC<EnhancedUploadProps> = ({ onUploadSuccess }) => {
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const { uploadFiles, isUploading } = useEnhancedUpload();

  const onDrop = useCallback(async (acceptedItems: any[]) => {
    const newFileTree: FileTreeNode[] = [];
    for (const item of acceptedItems) {
      if (item.webkitGetAsEntry) {
        const entry = item.webkitGetAsEntry();
        if (entry.isFile) {
          newFileTree.push({ name: item.name, file: item, children: [] });
        } else if (entry.isDirectory) {
          newFileTree.push(await traverseDirectory(entry));
        }
      } else {
        newFileTree.push({ name: item.name, file: item, children: [] });
      }
    }
    setFileTree((prevTree) => [...prevTree, ...newFileTree]);
  }, []);

  const traverseDirectory = async (
    dirEntry: FileSystemDirectoryEntry
  ): Promise<FileTreeNode> => {
    const children: FileTreeNode[] = [];
    const dirReader = dirEntry.createReader();
    const entries = await new Promise<FileSystemEntry[]>((resolve) =>
      dirReader.readEntries(resolve)
    );

    for (const entry of entries) {
      if (entry.isFile) {
        const file = await new Promise<File>((resolve) =>
          (entry as FileSystemFileEntry).file(resolve)
        );
        children.push({ name: entry.name, file, children: [] });
      } else if (entry.isDirectory) {
        children.push(
          await traverseDirectory(entry as FileSystemDirectoryEntry)
        );
      }
    }

    return { name: dirEntry.name, children };
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    noClick: true,
    noKeyboard: true,
  });

  const handleUpload = async () => {
    if (fileTree.length > 0) {
      const urls = await uploadFiles(fileTree);
      onUploadSuccess(urls);
      setFileTree([]); // Clear the file tree after successful upload
    }
  };

  return (
    <div>
      <div {...getRootProps()} className='dropzone'>
        <input
          {...getInputProps()}
          {...({
            directory: '',
            webkitdirectory: '',
          } as React.InputHTMLAttributes<HTMLInputElement>)}
        />
        {isDragActive ? (
          <p>Drop the files or folders here ...</p>
        ) : (
          <p>Drag 'n' drop files or folders here, or click to select</p>
        )}
      </div>
      {fileTree.length > 0 && (
        <div>
          <FileTree nodes={fileTree} />
          <button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload Files and Folders'}
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedUpload;
