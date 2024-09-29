import { useState } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface PDFViewerProps {
  url: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url }) => {
  const [numPages, setNumPages] = useState<number>(0);

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <Worker workerUrl='https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js'>
      <div style={{ height: '100%' }}>
        <Viewer
          fileUrl={url}
          plugins={[defaultLayoutPluginInstance]}
          onDocumentLoad={(e) => setNumPages(e.doc.numPages)}
        />
      </div>
    </Worker>
  );
};

export default PDFViewer;
