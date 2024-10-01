import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    setIsLoading(true);
    setQuestion('');

    // Display user's question
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: trimmedQuestion },
    ]);

    try {
      const response = await fetch(
        `http://localhost:4000/pdf/${pdfId === 'library' ? 'library-chat' : 'chat'}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question: trimmedQuestion, pdfId }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let assistantReply = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value);
          assistantReply += chunk;

          // Update the last assistant message
          setMessages((prevMessages) => {
            const lastMessage = prevMessages[prevMessages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              // Update existing assistant message
              return [
                ...prevMessages.slice(0, -1),
                { role: 'assistant', content: lastMessage.content + chunk },
              ];
            } else {
              // Add new assistant message
              return [...prevMessages, { role: 'assistant', content: chunk }];
            }
          });
        }
      }
    } catch (error) {
      console.error('Error chatting with PDF:', error);
      toast.error(`An error occurred: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='max-w-3xl mx-auto p-4 flex flex-col h-screen'>
      <div className='flex-grow space-y-4 overflow-y-auto pr-2'>
        {messages.length === 0 ? (
          <div className='flex items-center justify-center h-full text-gray-500'>
            No messages yet. Ask a question about the PDF.
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-100 ml-auto max-w-[80%]'
                  : 'bg-gray-100 border border-gray-200 max-w-[80%]'
              }`}
            >
              <p className='text-gray-800 whitespace-pre-wrap'>{msg.content}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className='bg-white p-4 rounded-t-lg shadow-sm sticky bottom-0'
      >
        <div className='flex space-x-2'>
          <input
            type='text'
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder='Ask a question about the PDF'
            className='flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800'
          />
          <button
            type='submit'
            disabled={isLoading || !question.trim()}
            className={`px-6 py-3 text-white font-semibold rounded-lg transition-colors ${
              isLoading || !question.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <svg
                className='animate-spin h-5 w-5 text-white'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                ></path>
              </svg>
            ) : (
              'Ask'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PdfChat;
