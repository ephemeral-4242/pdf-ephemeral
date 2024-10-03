'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Check, Eye, Languages } from 'lucide-react';
import { Button } from '../components/common/Button'; // Import Button

export default function Home() {
  const router = useRouter();

  const handleUploadSuccess = (url: string) => {
    const id = url.split('/').pop();
    router.push(`/chat/${id}`);
  };

  return (
    <div className='min-h-screen bg-gradient-to-b text-white'>
      <div className='container mx-auto px-4 py-12'>
        {/* Header */}
        <header className='mb-12 text-center'>
          <h1 className='text-5xl font-extrabold mb-4'>Smart PDF Vault App</h1>
          <p className='text-xl text-gray-300'>
            Upload your PDF and start chatting with it!
          </p>
        </header>

        {/* Main Content */}
        <main className='max-w-3xl mx-auto'>
          <div className='bg-gray-800 bg-opacity-50 rounded-lg shadow-xl p-8'>
            {/* Upload PDF button removed */}
          </div>
        </main>

        {/* How It Works */}
        <section className='mt-16'>
          <h2 className='text-3xl font-bold text-center mb-6'>How It Works</h2>
          <p className='text-lg text-gray-300 text-center max-w-2xl mx-auto'>
            Simply upload your PDF document, and our application will process
            it. Once uploaded, you can start a chat session with the content of
            the PDF.
          </p>
        </section>

        {/* Features */}
        <section className='mt-20'>
          <h2 className='text-3xl font-bold text-center mb-10'>Features</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <Feature
              Icon={Plus}
              title='Easy PDF Upload'
              description='Drag and drop your PDF or select it from your device.'
            />
            <Feature
              Icon={Check}
              title='Instant Chat'
              description='Interact with your PDF content in real-time.'
            />
            <Feature
              Icon={Eye}
              title='Secure and Private'
              description='Your documents are safely processed and stored.'
            />
            <Feature
              Icon={Languages}
              title='Multi-Language Support'
              description='Chat with PDFs in multiple languages.'
            />
          </div>
        </section>
      </div>
    </div>
  );
}

interface FeatureProps {
  Icon: React.ElementType;
  title: string;
  description: string;
}

const Feature: React.FC<FeatureProps> = ({ Icon, title, description }) => {
  return (
    <div className='bg-gray-800 bg-opacity-50 rounded-lg shadow-md p-6 transform transition-transform duration-300 hover:scale-105'>
      <div className='flex items-center mb-4'>
        <Icon className='w-12 h-12 text-blue-500' />
        <h3 className='text-xl font-semibold ml-4'>{title}</h3>
      </div>
      <p className='text-gray-300'>{description}</p>
    </div>
  );
};
