from flask import Flask, jsonify, send_from_directory, request, redirect, url_for,  render_template
from flask_cors import CORS, cross_origin
import os, sys 
import urllib.request 
from detection import detect_boxes
import cv2 
import numpy as np
import base64


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

    if file:
        file.save(os.path.join('static/uploads', file.filename))
        return jsonify({'message': 'File uploaded successfully'})


@app.route("/api/detect-boxes/<path:image_name>", methods=['GET'])
@cross_origin()
def detect_boxes(image_name):
    # PAS OUF DE PASSER L IMAGE COMME ça
    # faut trouver une autre solution
    image_data = detect_boxes(os.path.join(IMAGE_FOLDER, image_name))
    
    _, buffer = cv2.imencode('.jpg', image_data)
    image_base64 = base64.b64encode(buffer).decode('utf-8')

    return jsonify(image_base64)


if __name__ == "__main__":
    app.run(host='localhost', debug=True, port=8080)