import React, { useRef, useEffect } from 'react';
import './styles/style.css';

const Modal = ({ imageUrl, annotations, onClose }) => {
  const canvasRef = useRef(null);
    
  useEffect(() => { 
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    // console.log('debug', annotations);
    // console.log('Modal useEffect fired');

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      if (annotations) { 
        drawRectangles(ctx, annotations);
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
        <canvas ref={canvasRef} />
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Modal;
