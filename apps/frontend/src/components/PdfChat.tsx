import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Send, Loader2 } from 'lucide-react';
import { useChunkReceiver } from '../hooks/useChunkReceiver';
import { useMessageManager } from '@/hooks/useMessageManager';

// Define the Message interface
interface PdfChatProps {
  pdfId: string;
  initialQuestion?: string;
  onPdfChunkReceived?: (id: string) => void;
}

const PdfChat: React.FC<PdfChatProps> = ({
  pdfId,
  initialQuestion = '',
  onPdfChunkReceived,
}) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasSubmittedInitialQuestion = useRef(false);

  const { messages, setMessages, processIncomingChunk } = useMessageManager();

  // Handler for processing incoming chunks
  const { processChunk } = useChunkReceiver({
    onPdfChunkReceived,
    onAiContent: processIncomingChunk,
    onError: (message) => toast.error(`An error occurred: ${message}`),
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialQuestion && !hasSubmittedInitialQuestion.current) {
      hasSubmittedInitialQuestion.current = true;
      setQuestion(initialQuestion);
      handleSubmit(initialQuestion);
    }
  }, [initialQuestion]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (submittedQuestion: string) => {
    const trimmedQuestion = submittedQuestion.trim();
    if (!trimmedQuestion) return;

    setIsLoading(true);
    setQuestion('');
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: trimmedQuestion },
    ]);

    try {
      const response = await fetch(
        `http://localhost:4000/pdf/${pdfId === 'library' ? 'library-chat' : 'chat'}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: trimmedQuestion, pdfId }),
        }
      );

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);

        processChunk(chunk);
      }
    } catch (error: any) {
      console.error('Error chatting with PDF:', error);
      toast.error(`An error occurred: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(question);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
    adjustTextareaHeight();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Define keyframes for fade-in animation
  const fadeInStyle = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;

  // Define style for each word
  const wordStyle: React.CSSProperties = {
    opacity: 0,
    animation: 'fadeIn 0.5s forwards',
    display: 'inline',
  };

  return (
    <div className='flex flex-col h-full'>
      {/* Inline Styles */}
      <style>{fadeInStyle}</style>

      {/* Message Area */}
      <div className='flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-900'>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`p-4 rounded-lg max-w-xl ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-200'
              }`}
            >
              {msg.role === 'user' ? (
                <p className='whitespace-pre-wrap'>{msg.content}</p>
              ) : (
                <p className='whitespace-pre-wrap'>
                  {(msg.content as string[]).map((word, wIndex) => (
                    <span key={wIndex} style={wordStyle}>
                      {word}
                    </span>
                  ))}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleFormSubmit}
        className='px-6 py-4 flex bg-gray-900 items-center justify-center'
      >
        <div className='flex items-center w-full max-w-lg mx-auto bg-gray-800 rounded-full px-2'>
          <textarea
            ref={textareaRef}
            value={question}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder='Ask a question about the PDF...'
            className='flex-grow p-3 bg-transparent text-white resize-none overflow-hidden focus:outline-none'
            rows={1}
          />
          <button
            type='submit'
            disabled={isLoading || !question.trim()}
            className={`p-2 ${
              isLoading || !question.trim()
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            } rounded-full m-2`}
          >
            {isLoading ? (
              <Loader2 className='w-6 h-6 animate-spin text-white' />
            ) : (
              <Send className='w-6 h-6 text-white' />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PdfChat;
