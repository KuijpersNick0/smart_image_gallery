import React, { useState, useEffect } from 'react';
import axios from 'axios';


const GalleryImages = () => {
  const [imageList, setImageList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

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

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

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

  return (
    <div>
      <h2>Image Gallery</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {imageList.map((imageName) => (
          <img
            key={imageName}
            src={`http://localhost:8080/api/images/${imageName}`}
            alt={imageName}
            style={{ width: '150px', margin: '5px' }}
          />
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