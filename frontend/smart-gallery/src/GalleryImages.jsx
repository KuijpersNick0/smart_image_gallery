import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import Modal from './Modal'; 

const GalleryImages = () => {
  const [imageList, setImageList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const [selectedAnnotations, setSelectedAnnotations] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);

  // API call to fetch image list
  const fetchImageList = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/images');
      setImageList(response.data);
    } catch (error) {
      console.error('Error fetching image list:', error);
    }
  };

  // Fetch image list when the component mounts
  useEffect(() => {
    fetchImageList();
  }, []);

  // Handle file upload event
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // API call to upload file
  const handleUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        await axios.post('http://localhost:8080/api/upload', formData);
        // Refresh the image list after successful upload
        fetchImageList();
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

    // API call to detect boxes
  const handleDetectBoxes = async (imageName) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/detect-boxes/${imageName}`);
      console.log('Response for', imageName, ':', response.data); 
      // Ensure the annotations are associated with the correct image name
      return { image: imageName, annotations: response.data.annotations || [] };
    } catch (error) {
      console.error('Error detecting boxes:', error);
      return { image: imageName, annotations: [] };
    }
  };

  // Fetch annotations when the component mounts or imageList changes
  useEffect(() => {
    const fetchAnnotations = async () => {
      const annotationsPromises = imageList.map((imageName) => handleDetectBoxes(imageName));
      const annotationsData = await Promise.all(annotationsPromises);
      console.log('Fetched Annotations:', annotationsData); // Log the fetched annotations
      setAnnotations(annotationsData);
    };

    fetchAnnotations();
  }, [imageList]);
  
  // Show for the selected image the bounding boxes and put the focus on it
  const handleImageClick = (imageName) => {
    setSelectedImage(imageName);
    // Find selected annotations from the state
    const selectedAnno = annotations.find((anno) => anno.image === imageName);
    // Set selected annotations in the state
    console.log('Annotations for', imageName, ':', annotations.find((anno) => anno.image === imageName));
    setSelectedAnnotations(selectedAnno);

    setModalVisible(true);
  };

  // Close the focus
  const closeModal = () => {
    setSelectedImage(null);
    setModalVisible(false);
  };

  const drawRectangles = (ctx, annotations) => {
    annotations.forEach((annotation) => {
      const { x, y, width, height } = annotation.coordinates;
      const label = annotation.label;
  
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

  const handleCanvasDraw = () => {
    const canvas = document.getElementById('canvas'); 
    const ctx = canvas.getContext('2d'); 
    const selectedAnnotations = annotations.find((anno) => anno.image === selectedImage);
    
    // console.log('Selected Image:', selectedImage);
    // console.log('Selected Annotations:', selectedAnnotations);

    if (ctx && selectedAnnotations && selectedAnnotations.annotations) { 
      const img = new Image();
      img.src = `http://localhost:8080/api/images/${selectedImage}`;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.canvas.width = img.width; // Set canvas width
        ctx.canvas.height = img.height; // Set canvas height
        ctx.drawImage(img, 0, 0, img.width, img.height);

        drawRectangles(ctx, selectedAnnotations.annotations);
      };
    }
  };

  useEffect(() => {
    if (selectedImage) {
      handleCanvasDraw();
    }
  }, [selectedImage, annotations]);

  return (
    <div>
      <h2>Image Gallery</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {imageList.map((imageName, index) => (
         <div key={imageName} style={{ margin: '10px', position: 'relative' }}>
            <img
              src={`http://localhost:8080/api/images/${imageName}`}
              alt={imageName}
              style={{ width: '150px', cursor: 'pointer' }}
              onClick={() => handleImageClick(imageName)}
            />
            {selectedImage === imageName && (
              <canvas
                id="canvas"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  pointerEvents: 'none', // Allow click-through to the image
                }}
              />
            )}
          </div>
        ))}
      </div>
      <div>
        <h3>Upload New Image</h3>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload</button>
      </div>
      {modalVisible && (
        <Modal
          imageUrl={`http://localhost:8080/api/images/${selectedImage}`}
          annotations={selectedAnnotations && selectedAnnotations.annotations}
          onClose={closeModal}
      />
      )}
    </div>
  );
};
 

export default GalleryImages;