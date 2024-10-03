'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter from next/navigation
import { Send } from 'lucide-react'; // Import the Send icon from Lucide

export default function Home() {
  const [input, setInput] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      router.push(`/library-chat?question=${encodeURIComponent(input.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white'>
      <div className='w-full max-w-lg px-6 py-12 text-center'>
        <h1 className='text-3xl font-light mb-8 text-gray-200 opacity-90'>
          Chat with your library
        </h1>
        <form onSubmit={handleSubmit} className='relative'>
          <textarea
            className='w-full h-48 p-4 pr-16 bg-gray-800 bg-opacity-50 rounded-lg shadow-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out resize-none'
            placeholder='Upload your PDF and start chatting with it!'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown} // Add this line
          />
          <button
            type='submit'
            className='absolute bottom-4 right-4 w-10 h-10 bg-blue-600 rounded-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out flex items-center justify-center'
          >
            <Send className='w-5 h-5 text-white' />
          </button>
        </form>
      </div>
    </div>
  );
}
