import fetchApi from './index';

export function uploadPdf(formData: FormData) {
  return fetchApi('/pdf/upload', {
    method: 'POST',
    body: formData,
  });
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
