# Next Generation Image Gallery

Welcome to the Next Generation Image Gallery, a powerful and intelligent image management system designed to provide an enhanced user experience. This gallery not only allows users to upload and organize images but also leverages state-of-the-art machine learning models for object detection and person identification.

## Features

### Image Upload
- Users can easily upload images to the gallery using the intuitive interface.

### Object Detection
- An advanced object detector model analyzes uploaded images and provides bounding boxes around identified objects such as persons, animals, and more.

### Person Identification
- Utilizing a vision transformer trained with triplet loss, the gallery intelligently identifies and clusters bounding boxes representing the same person. If two bounding boxes correspond to the same person, they will be linked and identified accordingly.

### Image Modification
- Users have the flexibility to modify images within the gallery.
  - **Add Bounding Boxes:** Draw new bounding boxes that the model initially missed.
  - **Delete Bounding Boxes:** Remove unwanted bounding boxes.
  - **Rename Bounding Boxes:** Customize labels for better organization.

## Requirements

Make sure you have the following libraries installed:

- NumPy
- PyTorch
- CUDA
- TensorFlow
- timm

## Contributors
Baudouin LOSSEAU  (@195093@ecam.be)
Nick KUIJPERS (@20324@ecam.be)

License
This project is licensed under the MIT License - see the LICENSE file for details.

Feel free to contribute, report issues, or suggest improvements. Happy managing and exploring your images with the Next Generation Image Gallery!

 
