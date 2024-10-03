'use client';

import React from 'react';
import { Send } from 'lucide-react'; // Import the Send icon from Lucide

export default function Home() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white'>
      <div className='w-full max-w-lg px-6 py-12 text-center'>
        <h1
          className='text-3xl font-light mb-8 text-gray-200 opacity-90'
          style={{ fontFamily: 'Courier New, Courier, monospace' }}
        >
          Chat with your library
        </h1>
        <div className='relative'>
          <textarea
            className='w-full h-48 p-4 pr-16 bg-gray-800 bg-opacity-50 rounded-lg shadow-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out resize-none'
            placeholder='Upload your PDF and start chatting with it!'
          />
          <button className='absolute bottom-4 right-4 w-10 h-10 bg-blue-600 rounded-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out flex items-center justify-center'>
            <Send className='w-5 h-5 text-white' />
          </button>
        </div>
      </div>
    </div>
  );
}
