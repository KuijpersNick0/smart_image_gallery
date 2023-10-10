import React, { useState, useEffect } from 'react';
import axios from 'axios';


const GalleryImages = () => {
  const [imageList, setImageList] = useState([]);

  useEffect(() => {
    const fetchImageList = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/images');
        setImageList(response.data);
      } catch (error) {
        console.error('Error fetching image list:', error);
      }
    };

    fetchImageList();
  }, []);

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
    </div>
  );
};

export default GalleryImages;