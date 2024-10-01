import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Send, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PdfChatProps {
  pdfId: string;
}

const PdfChat: React.FC<PdfChatProps> = ({ pdfId }) => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuestion = question.trim();
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

      if (!response.ok || !response.body) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantReply = '';

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: '' },
      ]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        assistantReply += chunk;

        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          newMessages[newMessages.length - 1].content = assistantReply;
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error chatting with PDF:', error);
      toast.error(`An error occurred: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
    adjustTextareaHeight();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className='flex flex-col h-full bg-gray-900'>
      <div className='flex-grow overflow-y-auto p-4 space-y-4'>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white ml-auto max-w-[80%]'
                : 'bg-gray-800 text-gray-200 max-w-[80%]'
            }`}
          >
            <p className='whitespace-pre-wrap'>{msg.content}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className='p-4 bg-gray-800'>
        <div className='flex items-end space-x-2'>
          <textarea
            ref={textareaRef}
            value={question}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder='Ask a question about the PDF...'
            className='flex-grow p-2 bg-gray-700 text-white rounded-lg resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500'
            rows={1}
          />
          <button
            type='submit'
            disabled={isLoading || !question.trim()}
            className={`p-2 rounded-full ${
              isLoading || !question.trim()
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isLoading ? (
              <Loader2 className='w-6 h-6 animate-spin' />
            ) : (
              <Send className='w-6 h-6' />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PdfChat;
