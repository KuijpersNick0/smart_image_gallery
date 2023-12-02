import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios'; 

const Custom = () => {
  const location = useLocation();
  const imageUrl = location.state?.image;
  const canvasRef = useRef(null); 
  const [annotations, setAnnotations] = useState([]);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const fixedImageSize = 500; 
  const imageName = imageUrl.split('/').pop();

  useEffect(() => {
    axios.get(`http://localhost:8080/api/get-annotations/${imageName}`)
      .then(response => setAnnotations(response.data.annotations))
      .catch(console.error);
  }, []);

  useEffect(() => { 
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d'); 
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const scaleFactor = fixedImageSize / Math.max(img.width, img.height);
      canvas.width = img.width * scaleFactor;
      canvas.height = img.height * scaleFactor;

      ctx?.drawImage(img, 0, 0, img.width * scaleFactor, img.height * scaleFactor);
      if (showAnnotations && annotations.length > 0) {  
        drawRectangles(ctx, annotations, scaleFactor);
      } 
    };
  }, [imageUrl, annotations, showAnnotations]);

  const drawRectangles = (ctx, annotations, scaleFactor) => {  
    annotations.forEach(({ coordinates: { height, width, x, y }, label }) => { 
        const [scaledX, scaledY, scaledWidth, scaledHeight] = [x, y, width, height].map(dim => dim * scaleFactor);
        
        ctx.beginPath();
        ctx.rect(scaledX, scaledY, scaledWidth, scaledHeight);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FF0000';
        ctx.stroke();

        ctx.font = '14px Arial';
        ctx.fillStyle = '#FF0000';
        ctx.fillText(label, scaledX, scaledY - 5);
    });
  };

  return (
    <div>
      <button onClick={() => setShowAnnotations(!showAnnotations)}>
        {showAnnotations ? 'Hide Annotations' : 'Show Annotations'}
      </button>
      <canvas ref={canvasRef} style={{ width: '33.33%', float: 'left', margin: '20px' }} />
    </div>
  );
};

export default Custom;