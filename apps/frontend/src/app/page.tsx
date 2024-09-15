'use client';

import { useApi } from '../hooks/useApi';
import { getHello } from '../api/hello';

export default function Home() {
  const { data, error, isLoading } = useApi(getHello);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <h1 className='text-4xl font-bold'>Next.js + NestJS Fullstack App</h1>
      <p className='text-2xl'>{data?.message}</p>
    </main>
  );
}
