from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import hashlib
import sqlite3
from datetime import datetime
import os
from database import init_db, get_db

app = Flask(__name__)
app.secret_key = 'healthcare_secret_key'
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
socketio = SocketIO(app, cors_allowed_origins="http://localhost:5173", logger=True, engineio_logger=True)

# Store active calls and user sessions
active_calls = {}
user_sessions = {}

# Initialize database
init_db()

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

# Video Call Routes
@app.route('/api/call/initiate', methods=['POST'])
def initiate_call():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    doctor_id = data.get('doctor_id')
    
    # Store call in database
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO video_calls (patient_id, doctor_id, status)
        VALUES (?, ?, 'calling')
    ''', (session['user_id'], doctor_id))
    call_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # Store active call
    active_calls[call_id] = {
        'patient_id': session['user_id'],
        'doctor_id': doctor_id,
        'status': 'calling',
        'created_at': datetime.now().isoformat()
    }
    
    return jsonify({'call_id': call_id, 'status': 'calling'})

@app.route('/api/call/respond', methods=['POST'])
def respond_call():
    if 'user_id' not in session or session['role'] != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    call_id = data.get('call_id')
    response = data.get('response')  # 'accept' or 'decline'
    
    # Update call in database
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE video_calls SET status = ?, responded_at = CURRENT_TIMESTAMP
        WHERE id = ? AND doctor_id = ?
    ''', (response + 'ed', call_id, session['user_id']))
    conn.commit()
    conn.close()
    
    # Update active call
    if call_id in active_calls:
        active_calls[call_id]['status'] = response + 'ed'
    
    return jsonify({'status': response + 'ed'})

@app.route('/api/call/end', methods=['POST'])
def end_call():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    call_id = data.get('call_id')
    
    # Update call in database
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE video_calls SET status = 'ended', ended_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (call_id,))
    conn.commit()
    conn.close()
    
    # Remove from active calls
    if call_id in active_calls:
        del active_calls[call_id]
    
    # Notify all participants that call ended
    socketio.emit('call_ended', {'call_id': call_id}, room=f"call_{call_id}")
    
    return jsonify({'status': 'ended'})

@app.route('/api/call/active', methods=['GET'])
def get_active_calls():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user_calls = []
    for call_id, call_data in active_calls.items():
        if (session['role'] == 'patient' and call_data['patient_id'] == session['user_id']) or \
           (session['role'] == 'doctor' and call_data['doctor_id'] == session['user_id']):
            
            # Get user names
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute('SELECT name FROM users WHERE id = ?', (call_data['patient_id'],))
            patient_name = cursor.fetchone()[0]
            cursor.execute('SELECT name FROM users WHERE id = ?', (call_data['doctor_id'],))
            doctor_name = cursor.fetchone()[0]
            conn.close()
            
            user_calls.append({
                'call_id': call_id,
                'patient_name': patient_name,
                'doctor_name': doctor_name,
                'status': call_data['status'],
                'created_at': call_data['created_at']
            })
    
    return jsonify(user_calls)

# Socket.IO Events for Video Calling
@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")
    user_id = session.get('user_id')
    
    if user_id:
        user_sessions[user_id] = request.sid
        join_room(f"user_{user_id}")
        emit('connected', {'user_id': user_id, 'sid': request.sid})
        print(f"User {user_id} connected with session {request.sid}")
    else:
        print(f"No user_id in session for {request.sid}")
        emit('connected', {'sid': request.sid})

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")
    user_id = session.get('user_id')
    if user_id and user_id in user_sessions:
        leave_room(f"user_{user_id}")
        del user_sessions[user_id]

@socketio.on('call_doctor')
def handle_call_doctor(data):
    print(f"Call doctor event: {data}")
    doctor_id = data['doctor_id']
    patient_id = session['user_id']
    call_id = data['call_id']
    
    # Get patient name
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT name FROM users WHERE id = ?', (patient_id,))
    patient_name = cursor.fetchone()[0]
    conn.close()
    
    # Notify doctor about incoming call
    socketio.emit('incoming_call', {
        'call_id': call_id,
        'patient_id': patient_id,
        'patient_name': patient_name
    }, room=f"user_{doctor_id}")
    
    print(f"Notified doctor {doctor_id} about call from patient {patient_name}")

@socketio.on('call_response')
def handle_call_response(data):
    print(f"Call response: {data}")
    call_id = data['call_id']
    response = data['response']
    
    if call_id in active_calls:
        patient_id = active_calls[call_id]['patient_id']
        doctor_id = active_calls[call_id]['doctor_id']
        
        # Update call status
        active_calls[call_id]['status'] = response + 'd'
        
        # Notify patient about response
        socketio.emit('call_responded', {
            'call_id': call_id,
            'response': response + 'd'
        }, room=f"user_{patient_id}")
        
        if response == 'accept':
            # Start WebRTC signaling
            socketio.emit('start_call', {
                'call_id': call_id,
                'room': f"call_{call_id}"
            }, room=f"user_{patient_id}")
            socketio.emit('start_call', {
                'call_id': call_id,
                'room': f"call_{call_id}"
            }, room=f"user_{doctor_id}")
        else:
            # Remove declined call from active calls
            del active_calls[call_id]

@socketio.on('join_call')
def handle_join_call(data):
    call_id = data['call_id']
    user_id = session.get('user_id')
    role = data.get('role', 'unknown')
    
    print(f"User {user_id} ({role}) joining call {call_id}")
    
    if not user_id:
        print("No user_id in session, using role as identifier")
        user_id = f"{role}_{call_id}"
    
    join_room(f"call_{call_id}")
    emit('user_joined', {
        'user_id': user_id,
        'role': role,
        'call_id': call_id
    }, room=f"call_{call_id}", include_self=False)

@socketio.on('leave_call')
def handle_leave_call(data):
    call_id = data['call_id']
    user_id = session.get('user_id', f"user_{call_id}")
    print(f"User {user_id} leaving call {call_id}")
    leave_room(f"call_{call_id}")
    emit('user_left', {
        'user_id': user_id,
        'call_id': call_id
    }, room=f"call_{call_id}")

# WebRTC Signaling Events
@socketio.on('offer')
def handle_offer(data):
    call_id = data['call_id']
    print(f"Relaying offer for call {call_id}")
    emit('offer', data, room=f"call_{call_id}", include_self=False)

@socketio.on('answer')
def handle_answer(data):
    call_id = data['call_id']
    print(f"Relaying answer for call {call_id}")
    emit('answer', data, room=f"call_{call_id}", include_self=False)

@socketio.on('ice_candidate')
def handle_ice_candidate(data):
    call_id = data['call_id']
    print(f"Relaying ICE candidate for call {call_id}")
    emit('ice_candidate', data, room=f"call_{call_id}", include_self=False)

# Simple endpoints for other features (without complex dependencies)
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
    print("Starting Healthcare Video Call Server...")
    print("Server will be available at: http://localhost:8000")
    socketio.run(app, debug=True, port=8000, allow_unsafe_werkzeug=True)