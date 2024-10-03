import { useState, useCallback } from 'react';

interface ChunkReceiverOptions {
  onPdfChunkReceived?: (id: string) => void;
  onAiContent?: (content: string) => void;
  onError?: (message: string) => void;
}

export const useChunkReceiver = ({
  onPdfChunkReceived,
  onAiContent,
  onError,
}: ChunkReceiverOptions) => {
  const processChunk = useCallback(
    (chunk: string) => {
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(5));

          switch (data.type) {
            case 'pdf-detail':
              onPdfChunkReceived?.(data.id);
              break;
            case 'ai-content':
              onAiContent?.(data.content);
              break;
            case 'error':
              onError?.(data.message);
              break;
          }
        }
      }
    },
    [onPdfChunkReceived, onAiContent, onError]
  );

  return { processChunk };
};
