import React, { useState } from 'react';
import { BlobItem } from '../hooks/get-blobs';
import '../styles/BlobsVisualizer.css';

interface BlobsVisualizerProps {
  blobs: BlobItem[];
  loading: boolean;
}

export const BlobsVisualizer: React.FC<BlobsVisualizerProps> = ({ blobs, loading }) => {
  const [lightboxData, setLightboxData] = useState<{imageUrl: string, cid: string, date: string} | null>(null);
  
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  };
  
  const openLightbox = (blob: BlobItem) => {
    if (blob.imageUrl) {
      setLightboxData({
        imageUrl: blob.imageUrl,
        cid: blob.cid,
        date: formatDate(blob.createdAt)
      });
    }
  };
  
  const closeLightbox = () => {
    setLightboxData(null);
  };

  return (
    <div className="blobs-visualizer">
      {loading && blobs.length === 0 ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading blobs...</p>
        </div>
      ) : blobs.length > 0 ? (
        <div className="blobs-grid">
          {blobs.map((blob, index) => (
            <div key={`${blob.cid}-${index}`} className="blob-card">
              {blob.isImage && blob.imageUrl ? (
                <div className="blob-image-container">
                  <img 
                    src={blob.imageUrl} 
                    alt="Blob" 
                    className="blob-image" 
                    onClick={() => openLightbox(blob)}
                  />
                </div>
              ) : (
                <div className="blob-placeholder">
                  <span>Non-image blob</span>
                </div>
              )}
              <div className="blob-info">
                <p className="blob-cid">{blob.cid.substring(0, 10)}...</p>
                <p className="blob-date">{formatDate(blob.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No blobs found for this user</p>
        </div>
      )}
      
      {lightboxData && (
        <div className="lightbox" onClick={closeLightbox}>
          <div className="lightbox-content">
            <span className="close-button" onClick={closeLightbox}>&times;</span>
            <img src={lightboxData.imageUrl} alt="Full size" className="lightbox-image" />
            <div className="lightbox-info">
              <p className="lightbox-cid">{lightboxData.cid}</p>
              <p className="lightbox-date">{lightboxData.date}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
