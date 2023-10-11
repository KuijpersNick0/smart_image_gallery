import React, { useState, useEffect } from 'react';
import axios from 'axios';

// HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA

const GalleryImages = () => {
  const [imageList, setImageList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch the list of images on load
  const fetchImageList = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/images');
      setImageList(response.data);
    } catch (error) {
      console.error('Error fetching image list:', error);
    }
  };

  useEffect(() => {
    fetchImageList();
  }, []);

  // Handle file select for upload
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Handle upload button click
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

  // Handle click on an image for box detection
  const handleDetectBoxes = async (imageName) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/detect-boxes/${imageName}`, { responseType: 'text' });
      setSelectedImage(response.data);
    } catch (error) {
      console.error('Error detecting boxes:', error);
    }
  };

  return (
    <div>
      <h2>Image Gallery</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {imageList.map((imageName) => (
          <div key={imageName}>
            <img
              src={`http://localhost:8080/api/images/${imageName}`}
              alt={imageName}
              style={{ width: '150px', margin: '5px', cursor: 'pointer' }}
              onClick={() => handleDetectBoxes(imageName)}
            />
            <br />
            {selectedImage && (
              <img
                src={`data:image/jpeg;base64,${selectedImage}`}
                alt={`${imageName} with Bounding Boxes`}
                style={{ width: '300px', margin: '5px' }}
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
    </div>
  );
};

export default GalleryImages;