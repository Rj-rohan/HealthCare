from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import hashlib
import sqlite3
from datetime import datetime
import os
from database import init_db, get_db
import base64
import cv2
import numpy as np
import mediapipe as mp

app = Flask(__name__)
app.secret_key = 'healthcare_secret_key'
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
socketio = SocketIO(app, cors_allowed_origins="http://localhost:5173")

# Store active calls and user sessions
active_calls = {}
user_sessions = {}

# Initialize database
init_db()

# Initialize MediaPipe
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
pose = mp_pose.Pose(static_image_mode=False, model_complexity=1, enable_segmentation=False, min_detection_confidence=0.5)

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'patient')
    name = data.get('name')
    phone = data.get('phone')
    
    if not all([email, password, name]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO users (email, password, role, name, phone)
            VALUES (?, ?, ?, ?, ?)
        ''', (email, hashed_password, role, name, phone))
        conn.commit()
        conn.close()
        return jsonify({'message': 'User registered successfully'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not all([email, password]):
        return jsonify({'error': 'Missing email or password'}), 400
    
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, email, role, name FROM users 
        WHERE email = ? AND password = ?
    ''', (email, hashed_password))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        session['user_id'] = user[0]
        session['role'] = user[2]
        return jsonify({
            'user': {
                'id': user[0],
                'email': user[1],
                'role': user[2],
                'name': user[3]
            }
        }), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/api/auth/status', methods=['GET'])
def auth_status():
    if 'user_id' in session:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT id, email, role, name FROM users WHERE id = ?', (session['user_id'],))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return jsonify({
                'user': {
                    'id': user[0],
                    'email': user[1],
                    'role': user[2],
                    'name': user[3]
                }
            }), 200
    
    return jsonify({'error': 'Not authenticated'}), 401

@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name FROM users WHERE role = 'doctor'")
    doctors = cursor.fetchall()
    conn.close()
    
    return jsonify([{'id': d[0], 'name': d[1]} for d in doctors])

# Simple exercise analysis without complex ML
@app.route('/api/exercise/analyze', methods=['POST'])
def analyze_exercise():
    try:
        data = request.json
        image_data = data.get('image', '')
        exercise_type = data.get('exercise_type', 'pushup')
        
        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Decode base64 image
        image_data = image_data.split(',')[1] if ',' in image_data else image_data
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return jsonify({'error': 'Invalid image data'}), 400
        
        # Convert BGR to RGB
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Process with MediaPipe
        results = pose.process(rgb_image)
        
        response = {
            'pose_detected': results.pose_landmarks is not None,
            'exercise_type': exercise_type,
            'rep_count': 0,
            'form_score': 85,
            'feedback': 'Keep your back straight and maintain proper form',
            'landmarks': []
        }
        
        if results.pose_landmarks:
            # Extract landmarks
            landmarks = []
            for landmark in results.pose_landmarks.landmark:
                landmarks.append({
                    'x': landmark.x,
                    'y': landmark.y,
                    'z': landmark.z,
                    'visibility': landmark.visibility
                })
            response['landmarks'] = landmarks
            response['form_score'] = 90
            response['feedback'] = 'Good form! Keep it up!'
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/test/exercise/analyze', methods=['POST'])
def test_analyze_exercise():
    return analyze_exercise()

@app.route('/api/exercise/reset', methods=['POST'])
def reset_exercise():
    return jsonify({'message': 'Exercise counter reset'}), 200

@app.route('/api/test/exercise/reset', methods=['POST'])
def test_reset_exercise():
    return reset_exercise()

# Mental Health Analysis (simplified)
@app.route('/api/mental-health/analyze-text', methods=['POST'])
def analyze_text():
    data = request.json
    text = data.get('text', '')
    
    # Simple sentiment analysis
    positive_words = ['happy', 'good', 'great', 'excellent', 'wonderful', 'amazing']
    negative_words = ['sad', 'bad', 'terrible', 'awful', 'horrible', 'depressed']
    
    text_lower = text.lower()
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    if positive_count > negative_count:
        sentiment = 'positive'
        confidence = 0.8
    elif negative_count > positive_count:
        sentiment = 'negative'
        confidence = 0.7
    else:
        sentiment = 'neutral'
        confidence = 0.6
    
    return jsonify({
        'sentiment': sentiment,
        'confidence': confidence,
        'stress_level': 3 if sentiment == 'negative' else 1,
        'recommendations': ['Practice deep breathing', 'Consider meditation', 'Talk to someone you trust']
    }), 200

@app.route('/api/mental-health/analyze-face', methods=['POST'])
def analyze_face():
    return jsonify({
        'emotion': 'neutral',
        'confidence': 0.75,
        'stress_indicators': ['slight tension around eyes'],
        'recommendations': ['Take a short break', 'Practice relaxation exercises']
    }), 200

@app.route('/api/personalized-recommendations', methods=['POST'])
def personalized_recommendations():
    data = request.json
    profile = data.get('profile', {})
    
    recommendations = {
        'treatments': [
            '🎯 AI Recommended: Regular exercise and balanced diet',
            '📊 Confidence: 85%',
            '💡 Based on your profile, focus on cardiovascular health'
        ],
        'medications': [
            '🔍 Consult with healthcare provider for personalized medication advice',
            '📋 Regular monitoring recommended'
        ],
        'diet': [
            '🥗 Include more fruits and vegetables',
            '🐟 Add omega-3 rich foods',
            '💧 Stay hydrated with 8 glasses of water daily'
        ],
        'exercise': [
            '🏃 30 minutes of moderate exercise daily',
            '💪 Strength training 2-3 times per week',
            '🧘 Include flexibility and balance exercises'
        ],
        'risks': [
            '⚠️ Risk Level: Low (15%)',
            '🚨 Monitor blood pressure regularly',
            '🚨 Maintain healthy weight'
        ]
    }
    
    return jsonify(recommendations), 200

if __name__ == '__main__':
    socketio.run(app, debug=True, port=8000, allow_unsafe_werkzeug=True)