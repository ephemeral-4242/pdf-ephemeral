import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud } from 'react-icons/fi';

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
  });

  const handleUpload = async () => {
    if (fileTree.length > 0) {
      const urls = await uploadFiles(fileTree);
      onUploadSuccess(urls);
      setFileTree([]);
    }
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-gray-800'
            : 'border-gray-700 hover:border-blue-400'
        }`}
      >
        <input {...getInputProps()} />
        <FiUploadCloud className='mx-auto text-5xl text-gray-400 mb-4' />
        {isDragActive ? (
          <p className='text-lg text-blue-500 font-medium'>
            Drop files here...
          </p>
        ) : (
          <div>
            <p className='text-lg text-gray-200 font-medium mb-2'>
              Drag & drop files or folders here
            </p>
            <p className='text-sm text-gray-400'>Or click to select files</p>
          </div>
        )}
      </div>

      {fileTree.length > 0 && (
        <div className='mt-6'>
          <h3 className='text-lg font-semibold mb-2 text-gray-200'>
            Selected Files:
          </h3>
          <div className='bg-gray-800 rounded-lg p-4 max-h-60 overflow-y-auto'>
            <FileTree nodes={fileTree} />
          </div>
          <div className='mt-4'>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                isUploading
                  ? 'bg-blue-600 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isUploading ? 'Uploading...' : 'Upload Files and Folders'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedUpload;
