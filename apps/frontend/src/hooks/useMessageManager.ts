import { useState, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string | string[]; // User: string, Assistant: array of words
}

export function useMessageManager() {
  const [messages, setMessages] = useState<Message[]>([]);
  const bufferRef = useRef<string>('');

  const processIncomingChunk = (chunk: string) => {
    const tokens = splitIntoTokens(bufferRef.current + chunk);
    bufferRef.current = handleIncompleteToken(tokens);
    appendCompleteTokens(tokens);
  };

  const splitIntoTokens = (text: string): string[] => {
    return text.split(/(\s+)/);
  };

  const handleIncompleteToken = (tokens: string[]): string => {
    if (tokens.length === 0) return '';

    const lastToken = tokens[tokens.length - 1];
    if (!/^\s+$/.test(lastToken)) {
      tokens.pop();
      return lastToken;
    }
    return '';
  };

  const appendCompleteTokens = (tokens: string[]) => {
    tokens.forEach((token) => {
      if (token) appendWord(token);
    });
  };

  const appendWord = (word: string) => {
    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1];

      if (lastMessage && lastMessage.role === 'assistant') {
        const updatedMessage = {
          ...lastMessage,
          content: [...(lastMessage.content as string[]), word],
        };
        return [...prev.slice(0, -1), updatedMessage];
      } else {
        return [...prev, { role: 'assistant', content: [word] }];
      }
    });
  };

  const flushBuffer = () => {
    if (bufferRef.current) {
      const tokens = splitIntoTokens(bufferRef.current);
      bufferRef.current = '';
      appendCompleteTokens(tokens);
    }
  };

  const resetBuffer = () => {
    bufferRef.current = '';
  };

  return {
    messages,
    setMessages,
    processIncomingChunk,
    resetBuffer,
    flushBuffer,
  };
}
