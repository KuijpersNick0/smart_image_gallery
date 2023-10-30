import React, { useState, useRef, useEffect } from 'react';
import './styles/style.css';
import Loading from './Loading';

const Modal = ({ imageUrl, annotations, onClose, loading}) => {
  const canvasRef = useRef(null); 
  const [error, setError] = useState(false);

  useEffect(() => { 
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d'); 

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      try {
        ctx.drawImage(img, 0, 0, img.width, img.height); 
        if (annotations && annotations.length > 0) {  
          drawRectangles(ctx, annotations);
        } 
      } catch (error) {
        setError(true);
        console.error('Error drawing on canvas:', error);
      } 
    };
  }, [imageUrl, annotations]);

  const drawRectangles = (ctx, annotations) => {  
    annotations.forEach((annotation) => { 
        // console.log('Drawing annotation:', annotation);
        const { coordinates, label } = annotation;
        const { height, width, x, y } = coordinates;
        // console.log('Drawing rectangle:', x, y, width, height, label);
        // Draw the bounding box
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FF0000';
        ctx.stroke();

        // Draw the label
        ctx.font = '14px Arial';
        ctx.fillStyle = '#FF0000';
        ctx.fillText(label, x, y - 5);
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
