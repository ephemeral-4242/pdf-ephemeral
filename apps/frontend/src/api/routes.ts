import fetchApi from './index';

export const api = {
  hello: {
    getHello: () => fetchApi('/hello'),
  },
  pdf: {
    upload: async (formData: FormData) => {
      try {
        const result = await fetchApi('/pdf/upload', {
          method: 'POST',
          body: formData,
        });

        return result;
      } catch (error) {
        console.error('Unexpected error during upload:', error);
        return { error: 'Unexpected error during upload' };
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
};
