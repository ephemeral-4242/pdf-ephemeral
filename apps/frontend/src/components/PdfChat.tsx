import React, { useState } from 'react';

const PdfChat = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:4000/pdf/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (typeof data === 'string') {
        setAnswer(data);
      } else if (data && typeof data.answer === 'string') {
        setAnswer(data.answer);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error chatting with PDF:', error);
      setAnswer(`An error occurred: ${error.message}. Please try again.`);
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
      {answer && (
        <div className='bg-gray-100 p-4 rounded-md'>
          <h3 className='font-semibold text-lg mb-2'>Answer:</h3>
          <p className='text-gray-700'>{answer}</p>
        </div>
      )}
    </div>
  );
};

export default PdfChat;
