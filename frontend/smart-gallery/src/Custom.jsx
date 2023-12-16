import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios'; 

const Custom = () => {
  const location = useLocation();
  const imageUrl = location.state?.image;
  const canvasRef = useRef(null); 
  const [annotations, setAnnotations] = useState([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const fixedImageSize = 500; 
  const imageName = imageUrl.split('/').pop();
  const [showAllAnnotations, setShowAllAnnotations] = useState(true);
  const [newAnnotation, setNewAnnotation] = useState({label: '', name:'', coordinates: {x: '', y: '',height: '', width: '' } });
  const [drawing, setDrawing] = useState(false);
  const [rect, setRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [scaleFactor, setScaleFactor] = useState(1);

  useEffect(() => {
    axios.get(`http://localhost:8080/api/get-annotations/${imageName}`)
      .then(response => setAnnotations(response.data.annotations))
      .catch(console.error);
  }, [imageName]);

  useEffect(() => { 
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d'); 
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const scaleFactor = fixedImageSize / Math.max(img.width, img.height);
      setScaleFactor(scaleFactor);
      console.log(scaleFactor);
      canvas.width = img.width * scaleFactor;
      console.log(canvas.width);
      console.log(img.width);
      canvas.height = img.height * scaleFactor;

      ctx?.drawImage(img, 0, 0, img.width * scaleFactor, img.height * scaleFactor);
      if (selectedAnnotation) {  
        drawRectangle(ctx, selectedAnnotation, scaleFactor);
      } 
    };
  }, [imageUrl, selectedAnnotation]);

  const drawRectangle = (ctx, { coordinates: { height, width, x, y }, label }, scaleFactor) => {  
    const [scaledX, scaledY, scaledWidth, scaledHeight] = [x, y, width, height].map(dim => dim * scaleFactor);
    
    ctx.beginPath();
    ctx.rect(scaledX, scaledY, scaledWidth, scaledHeight);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FF0000';
    ctx.stroke();

    ctx.font = '14px Arial';
    ctx.fillStyle = '#FF0000';
    ctx.fillText(label, scaledX, scaledY - 5);
  };

  const handleSelectChange = (event) => {
    const annotation = annotations.find(ann => ann.id === event.target.value);
    setSelectedAnnotation(annotation);
  };

  const handleDeleteClick = () => {
    if (selectedAnnotation) {
      axios.delete(`http://localhost:8080/api/delete-annotation/${imageName}`, { data: { id: selectedAnnotation.id } })
        .then(() => {
          setAnnotations(annotations.filter(ann => ann.id !== selectedAnnotation.id));
          setSelectedAnnotation(null);
        })
        .catch(console.error);
    }
  };

  const handleModifyClick = () => {
    if (selectedAnnotation) {
      const newLabel = prompt('Enter new label');
      if (newLabel) {
        axios.put(`http://localhost:8080/api/modify-annotation/${imageName}`, { id: selectedAnnotation.id, newLabel })
          .then(() => {
            setAnnotations(annotations.map(ann => ann.id === selectedAnnotation.id ? { ...ann, label: newLabel } : ann));
            setSelectedAnnotation(null);
          })
          .catch(console.error);
      }
    }
  };

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
      if (showAllAnnotations) {
        annotations.forEach(annotation => drawRectangle(ctx, annotation, scaleFactor));
      } else if (selectedAnnotation) {  
        drawRectangle(ctx, selectedAnnotation, scaleFactor);
      } 
    };
  }, [imageUrl, selectedAnnotation, showAllAnnotations, annotations]);

  const handleShowAllClick = () => {
    setShowAllAnnotations(!showAllAnnotations);
  };

  const handleRecalculateClick = () => {
    axios.post(`http://localhost:8080/api/recalculate-annotations/${imageName}`)
      .then(response => setAnnotations(response.data.annotations))
      .catch(console.error);
  };

  // Ajoutez cette fonction pour gérer les changements dans le formulaire
  const handleInputChange = (event) => {
    setNewAnnotation({ ...newAnnotation, [event.target.name]: event.target.value });
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    axios.post(`http://localhost:8080/api/add-annotation/${imageName}`, newAnnotation)
      .then(response => setAnnotations([...annotations, response.data.annotation]))
      .catch(console.error);
  };

  const handleCoordinateChange = (event) => {
    setNewAnnotation({
      ...newAnnotation,
      coordinates: {
        ...newAnnotation.coordinates,
        [event.target.name]: event.target.value
      }
    });
  };

  const handleMouseDown = (event) => {
    setDrawing(true);
    setRect({ x: event.clientX, y: event.clientY, width: 0, height: 0 });
  };
  
  const handleMouseMove = (event) => {
    if (!drawing) return;
    setRect({
      ...rect,
      width: event.clientX - rect.x,
      height: event.clientY - rect.y,
    });
  };
  
  const handleMouseUp = () => {
    setDrawing(false);
    // Utilisez les coordonnées du rectangle pour créer une nouvelle annotation
    setNewAnnotation({
      ...newAnnotation,
      coordinates: {
        x: rect.x - 20,
        y: rect.y -105,
        width: rect.width / scaleFactor,
        height: rect.height / scaleFactor,
      },
    });
  };
  return (
    <div>
      <select onChange={handleSelectChange}>
        <option value="">Select an annotation</option>
        {annotations.map(({ id, label }) => (
          <option key={id} value={id}>{label}</option>
        ))}
      </select>
      <button onClick={handleDeleteClick}>Delete</button>
      <button onClick={handleModifyClick}>Modify</button>
      <button onClick={handleShowAllClick}>{showAllAnnotations ? 'Hide All' : 'Show All'}</button>
      <button onClick={handleRecalculateClick}>Recalculate</button>
      <canvas 
        ref={canvasRef} 
        style={{ width: '33.33%', float: 'left', margin: '20px' }} 
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <Link to="/">Back</Link>
      <form onSubmit={handleFormSubmit}>
        <input type="text" name="label" value={newAnnotation.label} onChange={handleInputChange} placeholder="Label" required />
        <input type="text" name="name" value={newAnnotation.name} onChange={handleInputChange} placeholder="Name" />
        <input type="text" name="x" value={newAnnotation.coordinates.x} onChange={handleCoordinateChange} placeholder="X" required />
        <input type="text" name="y" value={newAnnotation.coordinates.y} onChange={handleCoordinateChange} placeholder="Y" required /> 
        <input type="text" name="width" value={newAnnotation.coordinates.width} onChange={handleCoordinateChange} placeholder="Width" required />
        <input type="text" name="height" value={newAnnotation.coordinates.height} onChange={handleCoordinateChange} placeholder="Height" required />
        <button type="submit">Add Annotation</button>
      </form>
    </div>
  );
};

export default Custom;