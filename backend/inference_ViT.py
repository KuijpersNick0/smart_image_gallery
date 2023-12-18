import json
import torch
import torch.optim as optim
import timm 
import torch
from torch import nn, einsum
import torch.nn.functional as F

from einops import rearrange, repeat
from einops.layers.torch import Rearrange

import gdown

import torch.nn as nn
from torch.optim import Adam
from torch.nn import CrossEntropyLoss
from torchvision.transforms import ToTensor
from torchvision.datasets import MNIST
from torch.utils.data import DataLoader, Dataset
from tqdm import tqdm, trange
from torchvision import transforms

from torchvision import datasets, models

import os
from skimage import io

import torch
from PIL import Image

import numpy as np
import matplotlib.pyplot as plt
import cv2

import glob

from sklearn.cluster import KMeans
from sklearn.decomposition import PCA

from urllib.parse import urlparse

# Transformation for image
transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

def extract_features_from_bbox(image, bbox, model):
    # Assuming image is a numpy array
    x, y, width, height = bbox["x"], bbox["y"], bbox["width"], bbox["height"]
    cropped_image = image[y:y + height, x:x + width, :]
    transformed_image = transform(cropped_image)
    # Add batch dimension
    transformed_image = transformed_image.unsqueeze(0)
    return model(transformed_image)

def get_bbox_for_name_and_label(image_name, name, label):
    annotation_path = "static/annotations/" + image_name + ".json"
    with open(annotation_path, 'r') as json_file:
        data = json.load(json_file)
        for entry in data:
            if entry["name"] == name and entry["label"] == label:
                return entry["id"], entry["coordinates"]
    return None, None

def get_bbox_for_label(image_name, label):
    annotation_path = "static/annotations/" + image_name + ".json"
    with open(annotation_path, 'r') as file:
        data = json.load(file)

    for item in data:
        if item["label"] == label: 
            return item["id"], item["coordinates"]
    return None, None

def inference(name, label, image_name):    
    parsed_url = urlparse(image_name)
    image_name = parsed_url.path.split('/')[-1]
    reference_image_path = 'static/uploads/' + image_name
    other_image_names = os.listdir('static/uploads/')    
    other_image_names.remove(image_name) 

    # Create the model (trained)
    model = timm.create_model('deit3_small_patch16_224.fb_in1k', pretrained=True, num_classes = 0)
    model.load_state_dict(torch.load('weights/model_v3_deit3_small.pth'))
    model.eval()

    reference_image = cv2.imread(reference_image_path)  
    reference_id, reference_bbox = get_bbox_for_name_and_label(image_name, name, label)
    reference_features = extract_features_from_bbox(reference_image, reference_bbox, model)

    # Initialize a list to store features for clustering
    all_features = [reference_features] 
    all_ids = [reference_id]

    # Process other images
    for i, other_image_name in enumerate(other_image_names):
        id, bbox = get_bbox_for_label(other_image_name, label)
        if bbox is not None:  
            other_image = cv2.imread('static/uploads/' + other_image_name)
            other_features = extract_features_from_bbox(other_image, bbox, model)
            all_features.append(other_features)
            all_ids.append(id) 

    # Stack all features into a tensor
    all_features_tensor = torch.stack(all_features)

    # Perform clustering
    cluster_labels = cluster_features(all_features_tensor)

    # Get the cluster label of the original image
    original_image_cluster_label = cluster_labels[0]

    # Remove original image from the list
    all_ids = all_ids[1:]
    cluster_labels = cluster_labels[1:]

    # Find other images in the same cluster as the original image
    same_cluster_ids = [id for id, label in zip(all_ids, cluster_labels) if label == original_image_cluster_label]

    return same_cluster_ids

def visualize_features(outputs):
    # Assuming the shape of outputs is (batch_size, num_features)
    batch_size, num_features = outputs.shape

    # Plot each feature for each image in the batch
    for i in range(batch_size):
        plt.figure(figsize=(12, 6))
        plt.plot(outputs[i].numpy(), marker='o', linestyle='-', color='b')
        plt.title(f'Features for Image {i + 1}')
        plt.xlabel('Feature Index')
        plt.ylabel('Feature Value')
        plt.grid(True)
        plt.show()

def cluster_features(outputs, num_clusters=3): 
    outputs = outputs.view(outputs.size(0), -1) 
    # Perform dimensionality reduction for visualization (you can skip this step if the feature dimension is low)
    pca = PCA(n_components=2)
    reduced_features = pca.fit_transform(outputs.detach().numpy())

    # Apply K-means clustering
    kmeans = KMeans(n_clusters=num_clusters, random_state=42)
    cluster_labels = kmeans.fit_predict(reduced_features)

    return cluster_labels


def visualize_clusters(outputs, cluster_labels):
    # Assuming the shape of outputs is (batch_size, num_features)
    plt.figure(figsize=(10, 8))

    # Scatter plot the clustered features and annotate with image filenames
    for i, (x, y, label, path) in enumerate(zip(outputs[:, 0].numpy(), outputs[:, 1].numpy(), cluster_labels, image_paths)):
        plt.scatter(x, y, c=label, cmap='viridis', s=50)
        plt.annotate(f'{path.split("/")[-1]}', (x, y), textcoords="offset points", xytext=(0, 5), ha='center')

    plt.title('Clustered Features')
    plt.xlabel('Principal Component 1')
    plt.ylabel('Principal Component 2')
    plt.colorbar()
    plt.show()

if __name__ == "__main__":
    # # Example usage
    # image_paths = ['../static/uploads/EmilieCV.png', '../static/uploads/ppCV.jpg', '../static/uploads/LISBOA.jpg', '../static/uploads/ppCV(3).jpg', '../static/uploads/JULES.jpg' ]
    # outputs = inference(image_paths)
    # print(outputs.shape) 

    # # Visualize the features
    # # visualize_features(outputs)

    # # Cluster the features
    # cluster_labels = cluster_features(outputs)

    # # Visualize the clusters
    # visualize_clusters(outputs, cluster_labels)


    # Example usage
    name = "Nick"
    label = "person"
    image_name = "ppCV.jpg"

    # AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAs
    
    
    # Extract features and perform clustering
    same_cluster_ids = inference(name, label, image_name)
    print(same_cluster_ids)