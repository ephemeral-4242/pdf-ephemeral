import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/routes';

export interface PDF {
  id: string;
  fileName: string;
  uploadDate: string;
  folder?: {
    id: string;
    name: string;
  };
}

export const usePDFs = () => {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPdfs = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedPdfs = await api.pdf.getAll();
      setPdfs(fetchedPdfs);
    } catch (error) {
      console.error('Error fetching PDFs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPdfs();
  }, [fetchPdfs]);

  const groupedPdfs = pdfs.reduce(
    (acc, pdf) => {
      const folderName = pdf.folder?.name || 'Root';
      acc[folderName] = [...(acc[folderName] || []), pdf];
      return acc;
    },
    {} as Record<string, PDF[]>
  );

  return { pdfs, setPdfs, isLoading, groupedPdfs, refetchPdfs: fetchPdfs };
};
