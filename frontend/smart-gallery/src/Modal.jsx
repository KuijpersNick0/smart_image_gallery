import React, { useState, useRef, useEffect } from 'react';
import './styles/style.css';
import Loading from './Loading';

const Modal = ({ imageUrl, annotations, onClose, loading}) => {
  const canvasRef = useRef(null); 
  const [error, setError] = useState(false);

  const fixedImageSize = 500; 

  useEffect(() => { 
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d'); 
    
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const scaleFactor = fixedImageSize / Math.max(img.width, img.height);
      canvas.width = img.width * scaleFactor;
      canvas.height = img.height * scaleFactor;

      try {
        ctx.drawImage(img, 0, 0, img.width * scaleFactor, img.height * scaleFactor);
        if (annotations && annotations.length > 0) {  
          drawRectangles(ctx, annotations, scaleFactor);
        } 
      } catch (error) {
        setError(true);
        console.error('Error drawing on canvas:', error);
      } 
    };
  }, [imageUrl, annotations]);

  const drawRectangles = (ctx, annotations, scaleFactor) => {  
    annotations.forEach((annotation) => { 
        // console.log('Drawing annotation:', annotation);
        const { coordinates, label } = annotation;
        const { height, width, x, y } = coordinates;
        // console.log('Drawing rectangle:', x, y, width, height, label);
        // Scale the coordinates
        const scaledX = x * scaleFactor;
        const scaledY = y * scaleFactor;
        const scaledWidth = width * scaleFactor;
        const scaledHeight = height * scaleFactor;
        
        // Draw the bounding box
        ctx.beginPath();
        ctx.rect(scaledX, scaledY, scaledWidth, scaledHeight);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FF0000';
        ctx.stroke();

        // Draw the label
        ctx.font = '14px Arial';
        ctx.fillStyle = '#FF0000';
        ctx.fillText(label, scaledX, scaledY - 5);
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      {loading && <Loading text="Fetching annotation..." />}
      {error && <div>Error loading image</div>}
      {!loading && !error && <canvas ref={canvasRef} />}
      <button onClick={onClose}>Close</button>
    </div>
  </div>
  );
};

export default Modal;
