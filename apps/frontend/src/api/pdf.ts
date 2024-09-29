import fetchApi from './index';

export async function uploadPdf(
  formData: FormData,
  onProgress: (chunk: string) => void
) {
  const response = await fetch('http://localhost:4000/pdf/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok || !response.body) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let done = false;

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (value) {
      const chunk = decoder.decode(value);
      onProgress(chunk);
    }
  }
}

export function compareWithTemplate(data: { templateText: string }) {
  return fetchApi('/pdf/compare', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}
