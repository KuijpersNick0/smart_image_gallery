from flask import Flask, jsonify, send_from_directory, request, send_file
from flask_cors import CORS, cross_origin
import os, sys 
import urllib.request 
from detection import detect_boxes
import cv2 
import numpy as np
import base64
import io
import json
import uuid

# app instance
app = Flask(__name__)
CORS(app)

# upload folder
IMAGE_FOLDER = 'static/uploads/'
# Security 
app.config['UPLOAD_FOLDER'] = IMAGE_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 32 * 1024 * 1024

ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif'])
 
def allowed_file(filename):
	return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/images')
@cross_origin()
def get_image_list(): 
    images = [f for f in os.listdir(IMAGE_FOLDER) if os.path.isfile(os.path.join(IMAGE_FOLDER, f))]
    return jsonify(images)

@app.route("/api/images/<path:image_name>", methods=['GET'])
@cross_origin()
def get_image(image_name):
    filen = IMAGE_FOLDER + image_name 
    return send_from_directory(IMAGE_FOLDER, image_name)

@app.route('/api/upload', methods=['POST'])
@cross_origin()
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    # if file and allowed_file(file.filename):
    if file:
        file.save(os.path.join('static/uploads', file.filename))
        return jsonify({'message': 'File uploaded successfully'})

ANNOTATIONS_FOLDER = 'static/annotations/'

@app.route('/api/detect-boxes/<path:image_name>', methods=['GET'])
@cross_origin()
def detect_boxes_route(image_name):
    image_path = os.path.join(IMAGE_FOLDER, image_name)
    json_path = os.path.join(ANNOTATIONS_FOLDER, f'{image_name}.json')

    # Créer le dossier s'il n'existe pas
    if not os.path.exists(ANNOTATIONS_FOLDER):
        os.makedirs(ANNOTATIONS_FOLDER)

    if os.path.exists(json_path):
        with open(json_path, 'r') as f:
            annotations = json.load(f)
    else:
        annotations = detect_boxes(image_path)
        with open(json_path, 'w') as f:
            json.dump(annotations, f)
    
    return jsonify({'annotations': annotations})

@app.route('/api/recalculate-annotations/<path:image_name>', methods=['POST'])
@cross_origin()
def recalculate_annotations_route(image_name):
    image_path = os.path.join(IMAGE_FOLDER, image_name)
    json_path = os.path.join(ANNOTATIONS_FOLDER, f'{image_name}.json')

    annotations = detect_boxes(image_path)
    with open(json_path, 'w') as f:
        json.dump(annotations, f)
    
    return jsonify({'annotations': annotations})

@app.route('/api/get-annotations/<path:image_name>', methods=['GET'])
@cross_origin()
def get_annotations_route(image_name):
    json_path = os.path.join(ANNOTATIONS_FOLDER, f'{image_name}.json')

    if os.path.exists(json_path):
        with open(json_path, 'r') as f:
            annotations = json.load(f)
        return jsonify({'annotations': annotations})
    else:
        return jsonify({'error': 'Annotations not found'}), 404


@app.route('/api/delete-annotation/<path:image_name>', methods=['DELETE'])
@cross_origin()
def delete_annotation(image_name):
    id = request.json['id']
    json_path = os.path.join(ANNOTATIONS_FOLDER, f'{image_name}.json')

    if os.path.exists(json_path):
        with open(json_path, 'r') as f:
            annotations = json.load(f)
        
        # Filter out the annotation with the provided id
        annotations = [ann for ann in annotations if ann['id'] != id]

        # Save the remaining annotations back to the file
        with open(json_path, 'w') as f:
            json.dump(annotations, f)

        return jsonify({'message': 'Annotation deleted successfully'})
    else:
        return jsonify({'error': 'Annotations not found'}), 405

@app.route('/api/modify-annotation/<path:image_name>', methods=['PUT'])
@cross_origin()
def modify_annotation(image_name):
    id = request.json['id']
    new_name = request.json['newName']
    json_path = os.path.join(ANNOTATIONS_FOLDER, f'{image_name}.json')

    if os.path.exists(json_path):
        with open(json_path, 'r') as f:
            annotations = json.load(f)
        
        # Modify the name of the annotation with the provided id
        for ann in annotations:
            if ann['id'] == id:
                ann['name'] = new_name

        # Save the modified annotations back to the file
        with open(json_path, 'w') as f:
            json.dump(annotations, f)

        return jsonify({'message': 'Annotation modified successfully'})
    else:
        return jsonify({'error': 'Annotations not found'}), 407

@app.route('/api/add-annotation/<path:image_name>', methods=['POST'])
@cross_origin()
def add_annotation_route(image_name):
    json_path = os.path.join(ANNOTATIONS_FOLDER, f'{image_name}.json')
    new_annotation = request.json

    # Ajouter un identifiant unique à chaque annotation
    new_annotation['id'] = str(uuid.uuid4())

    if os.path.exists(json_path):
        with open(json_path, 'r+') as f:
            annotations = json.load(f)
            annotations.append(new_annotation)
            f.seek(0)
            json.dump(annotations, f)
        return jsonify({'annotation': new_annotation})
    else:
        return jsonify({'error': 'Annotations not found'}), 404

if __name__ == "__main__":
    app.run(host='localhost', debug=True, port=8080)