import React, { useState } from 'react';
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
      const response = await fetch('http://localhost:4000/pdf/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: trimmedQuestion, pdfId }),
      });

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
    <div className='space-y-6'>
      <form onSubmit={handleSubmit} className='flex space-x-2'>
        <input
          type='text'
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder='Ask a question about the PDF'
          className='flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
        <button
          type='submit'
          disabled={isLoading || !question.trim()}
          className={`px-4 py-2 text-white rounded-md transition-colors ${
            isLoading || !question.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isLoading ? 'Asking...' : 'Ask'}
        </button>
      </form>

      <div className='space-y-4'>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-4 rounded-md ${
              msg.role === 'user' ? 'bg-blue-100 self-end' : 'bg-gray-100'
            }`}
          >
            <p className='text-gray-700 whitespace-pre-wrap'>{msg.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PdfChat;
