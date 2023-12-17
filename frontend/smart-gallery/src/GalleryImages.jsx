import React, { useState, useEffect} from 'react';
import axios from 'axios'; 

import Modal from './Modal'; 
import Loading from './Loading';

const GalleryImages = () => {
  const [imageList, setImageList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  // State to store the annotations for all images
  const [annotations, setAnnotations] = useState([]);
  // State to store the selected image name
  const [selectedImage, setSelectedImage] = useState(null);
  // State to store the annotations for the selected image
  const [selectedAnnotations, setSelectedAnnotations] = useState(null);
  // Modal state, focus on the image
  const [modalVisible, setModalVisible] = useState(false);
  // Loading state when annotations or images are being fetched 
  const [loadingImages, setLoadingImages] = useState(true); 
  const [loadingAnnotations, setAnnotationsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [FilteredImageList, setFilteredImageList] = useState([]);

  
  // Fetch image list when the component mounts
  useEffect(() => {
    fetchImageList();
  }, []);

  // API call to fetch image list
  const fetchImageList = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/images');
      setImageList(response.data);
      setFilteredImageList(response.data); // Ajoutez cette ligne
    } catch (error) {
      console.error('Error fetching image list:', error);
    } finally {
      setLoadingImages(false);
    }
  };

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
      // console.log('Response for', imageName, ':', response.data); 
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
      setAnnotationsLoading(true);
      try {
        const annotationsPromises = imageList.map((imageName) => handleDetectBoxes(imageName));
        const annotationsData = await Promise.all(annotationsPromises);
        // console.log('Fetched Annotations GalleryImages.jsx:', annotationsData); 
        setAnnotations(annotationsData);
      } catch (error) {
        // console.error('Error fetching annotations:', error);
      } finally {
        setAnnotationsLoading(false); 
      }
    };
    fetchAnnotations();
  }, [imageList]);
  
  // Show for the selected image the bounding boxes and put the focus on it
  const handleImageClick = (imageName) => {
    setSelectedImage(imageName);
    setModalVisible(true);
  };

  // Close the focus
  const closeModal = () => {
    setSelectedImage(null);
    setModalVisible(false);
  };

  useEffect(() => {
    // Find selected annotations from the state
    const selectedAnno = annotations.find((anno) => anno.image === selectedImage);
    // Set selected annotations in the state
    setSelectedAnnotations(selectedAnno);
  }, [annotations, selectedImage]);

  // Set a fixed size for the displayed images
  const fixedImageSize = 150;

  const handleSearchChange = (event) => {
    const newSearchValue = event.target.value;
    setSearchValue(newSearchValue);
    updateFilteredImageList(newSearchValue);
  };

  const [allAnnotations, setAllAnnotations] = useState({});

  useEffect(() => {
    let requests = imageList.map(imageName => {
      return axios.get(`http://localhost:8080/api/get-annotations/${imageName}`)
        .then(response => {
          return { imageName, annotations: response.data.annotations };
        })
        .catch(console.error);
    });
    Promise.all(requests).then(results => {
      let newAllAnnotations = {};
      results.forEach(result => {
        // Check if result is not undefined before accessing its properties
        if (result) {
          newAllAnnotations[result.imageName] = result.annotations;
        }
      });
      setAllAnnotations(newAllAnnotations);
    });
  }, [imageList]);

  const updateFilteredImageList = (searchValue) => {
    console.log('updateFilteredImageList', searchValue);
    if (searchValue === '') {
      setFilteredImageList(imageList);
      return;
    }
    let newFilteredList = [];
    for (let imageName in allAnnotations) {
      if (allAnnotations[imageName].some(annotation => 
        annotation.name.includes(searchValue) || annotation.label.includes(searchValue))) {
        newFilteredList.push(imageName);
      }
    }
    setFilteredImageList(newFilteredList);
  };

  return (
    <div>
      <h2>Image Gallery</h2>
      <input 
      type="text" 
      placeholder="Search..." 
      value={searchValue} 
      onChange={handleSearchChange} 
    />
      {loadingImages ? (
        <Loading text="Fetching images..." />
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {FilteredImageList.map((imageName, index) => (
            <div key={imageName} style={{ margin: '10px', position: 'relative' }}>
              <img
                src={`http://localhost:8080/api/images/${imageName}`}
                alt={imageName}
                style={{ width: fixedImageSize, height: fixedImageSize, cursor: 'pointer' }}
                onClick={() => handleImageClick(imageName)}
              />
            </div>
          ))}
        </div>
      )}
      <div>
        <h3>Upload New Image</h3>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload</button>
      </div>
      {modalVisible && (
        <Modal
          imageUrl={`http://localhost:8080/api/images/${selectedImage}`}
          annotations={selectedAnnotations ? selectedAnnotations.annotations : []}
          onClose={closeModal} 
          loading={loadingAnnotations}
        />
      )}
    </div>
  );
};
 

export default GalleryImages;