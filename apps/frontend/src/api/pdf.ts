import fetchApi from './index';

export function uploadPdf(formData: FormData) {
  return fetchApi('/pdf/upload', {
    method: 'POST',
    body: formData,
  });
}

export function chatWithPdf(question: string) {
  return fetchApi('/pdf/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });
}
