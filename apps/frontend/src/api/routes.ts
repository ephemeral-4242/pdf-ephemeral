import fetchApi from './index';

export const api = {
  hello: {
    getHello: () => fetchApi('/hello'),
  },
  pdf: {
    upload: async (formData: FormData, onProgress: (chunk: string) => void) => {
      const response = await fetch('http://localhost:4000/pdf/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = '';

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        result += chunk;
        onProgress(chunk);
      }

      try {
        return JSON.parse(result);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        throw new Error('Invalid JSON response from server');
      }
    },
    getAll: () => fetchApi('/pdf'),
    getAllFolders: () => fetchApi('/pdf/folders'),
    chat: (question: string, pdfId: string) =>
      fetchApi('/pdf/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, pdfId }),
      }),
    libraryChat: (question: string) =>
      fetchApi('/pdf/library-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      }),
    createFolder: (name: string) =>
      fetchApi('/pdf/create-folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      }),
  },
  contractAnalysis: {
    upload: (formData: FormData) =>
      fetchApi('/contract-analysis/upload', {
        method: 'POST',
        body: formData,
      }),
  },
};
