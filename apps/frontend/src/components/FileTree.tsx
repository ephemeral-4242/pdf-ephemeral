import React from 'react';

export interface FileTreeNode {
  name: string;
  file?: File;
  children: FileTreeNode[];
}

interface FileTreeProps {
  nodes: FileTreeNode[];
  level?: number;
}

export const FileTree: React.FC<FileTreeProps> = ({ nodes, level = 0 }) => {
  return (
    <ul style={{ paddingLeft: `${level * 20}px` }}>
      {nodes.map((node, index) => (
        <li key={index}>
          {node.file ? '📄' : '📁'} {node.name}
          {node.children.length > 0 && (
            <FileTree nodes={node.children} level={level + 1} />
          )}
        </li>
      ))}
    </ul>
  );
};
