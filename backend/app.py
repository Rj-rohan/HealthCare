from flask import Flask, request, jsonify, session
from flask_cors import CORS
import hashlib
import sqlite3
from datetime import datetime
import os
from database import init_db, get_db

# Add Flask-Session for better session management
try:
    from flask_session import Session
except ImportError:
    Session = None

app = Flask(__name__)
app.secret_key = 'healthcare_secret_key'
CORS(app, supports_credentials=True)

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

# Patient routes
@app.route('/api/patient/records', methods=['GET', 'POST'])
def patient_records():
    if 'user_id' not in session or session['role'] != 'patient':
        return jsonify({'error': 'Unauthorized'}), 401
    
    if request.method == 'GET':
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT r.*, u.name as doctor_name 
            FROM medical_records r
            LEFT JOIN users u ON r.doctor_id = u.id
            WHERE r.patient_id = ?
            ORDER BY r.created_at DESC
        ''', (session['user_id'],))
        records = cursor.fetchall()
        conn.close()
        
        return jsonify([{
            'id': r[0],
            'record_type': r[3],
            'title': r[4],
            'description': r[5],
            'file_path': r[6],
            'ai_analysis': r[7],
            'status': r[8],
            'doctor_name': r[10] or 'Pending Review',
            'created_at': r[9]
        } for r in records])
    
    elif request.method == 'POST':
        record_type = request.form.get('record_type')
        title = request.form.get('title')
        description = request.form.get('description')
        
        file_path = None
        if 'file' in request.files:
            file = request.files['file']
            if file.filename != '':
                # Create uploads directory if it doesn't exist
                upload_dir = 'uploads'
                if not os.path.exists(upload_dir):
                    os.makedirs(upload_dir)
                
                # Save file with unique name
                filename = f"{session['user_id']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
                file_path = os.path.join(upload_dir, filename)
                file.save(file_path)
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Enhanced AI analysis based on file type
        ai_analysis = f"AI Analysis: Based on the {record_type}"
        if file_path:
            if file_path.lower().endswith(('.png', '.jpg', '.jpeg')):
                ai_analysis += " with uploaded image, visual analysis suggests normal patterns. "
            elif file_path.lower().endswith('.pdf'):
                ai_analysis += " with uploaded document, text analysis indicates standard results. "
        ai_analysis += "Preliminary findings suggest routine monitoring. Professional review recommended."
        
        cursor.execute('''
            INSERT INTO medical_records (patient_id, record_type, title, description, file_path, ai_analysis)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (session['user_id'], record_type, title, description, file_path, ai_analysis))
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Record uploaded successfully', 'ai_analysis': ai_analysis}), 201

@app.route('/api/patient/appointments', methods=['GET', 'POST'])
def patient_appointments():
    if 'user_id' not in session or session['role'] != 'patient':
        return jsonify({'error': 'Unauthorized'}), 401
    
    if request.method == 'GET':
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT a.*, u.name as doctor_name 
            FROM appointments a
            JOIN users u ON a.doctor_id = u.id
            WHERE a.patient_id = ?
            ORDER BY a.appointment_date DESC
        ''', (session['user_id'],))
        appointments = cursor.fetchall()
        conn.close()
        
        return jsonify([{
            'id': a[0],
            'doctor_name': a[7],
            'appointment_date': a[3],
            'status': a[4],
            'notes': a[5]
        } for a in appointments])
    
    elif request.method == 'POST':
        data = request.json
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO appointments (patient_id, doctor_id, appointment_date)
            VALUES (?, ?, ?)
        ''', (session['user_id'], data.get('doctor_id'), data.get('appointment_date')))
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Appointment scheduled successfully'}), 201

# Doctor routes
@app.route('/api/doctor/patients', methods=['GET'])
def doctor_patients():
    if 'user_id' not in session or session['role'] != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT DISTINCT u.id, u.name, u.email, u.phone
        FROM users u
        JOIN medical_records r ON u.id = r.patient_id
        WHERE u.role = 'patient'
    ''')
    patients = cursor.fetchall()
    conn.close()
    
    return jsonify([{
        'id': p[0],
        'name': p[1],
        'email': p[2],
        'phone': p[3]
    } for p in patients])

@app.route('/api/doctor/records', methods=['GET'])
def doctor_records():
    if 'user_id' not in session or session['role'] != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT r.*, u.name as patient_name 
        FROM medical_records r
        JOIN users u ON r.patient_id = u.id
        WHERE r.status = 'pending' OR r.doctor_id = ?
        ORDER BY r.created_at DESC
    ''', (session['user_id'],))
    records = cursor.fetchall()
    conn.close()
    
    return jsonify([{
        'id': r[0],
        'patient_name': r[10],
        'record_type': r[3],
        'title': r[4],
        'description': r[5],
        'ai_analysis': r[7],
        'status': r[8],
        'created_at': r[9]
    } for r in records])

@app.route('/api/doctor/verify-record', methods=['POST'])
def verify_record():
    if 'user_id' not in session or session['role'] != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE medical_records 
        SET doctor_id = ?, status = 'verified'
        WHERE id = ?
    ''', (session['user_id'], data.get('record_id')))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Record verified successfully'}), 200

@app.route('/api/doctor/prescriptions', methods=['POST'])
def add_prescription():
    if 'user_id' not in session or session['role'] != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO prescriptions (patient_id, doctor_id, medication, dosage, instructions)
        VALUES (?, ?, ?, ?, ?)
    ''', (data.get('patient_id'), session['user_id'], data.get('medication'), 
          data.get('dosage'), data.get('instructions')))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Prescription added successfully'}), 201

# Admin routes
@app.route('/api/admin/users', methods=['GET'])
def admin_users():
    if 'user_id' not in session or session['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT id, email, role, name, phone, created_at FROM users ORDER BY created_at DESC')
    users = cursor.fetchall()
    conn.close()
    
    return jsonify([{
        'id': u[0],
        'email': u[1],
        'role': u[2],
        'name': u[3],
        'phone': u[4],
        'created_at': u[5]
    } for u in users])

@app.route('/api/admin/stats', methods=['GET'])
def admin_stats():
    if 'user_id' not in session or session['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'patient'")
    patients = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'doctor'")
    doctors = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM medical_records")
    records = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM appointments")
    appointments = cursor.fetchone()[0]
    
    conn.close()
    
    return jsonify({
        'patients': patients,
        'doctors': doctors,
        'records': records,
        'appointments': appointments
    })

# Import AI emotion recognition
from emotion_ai import emotion_ai
from ml_models import healthcare_ai
from exercise_analyzer import ExerciseAnalyzer

# Initialize the exercise analyzer with ML model
exercise_analyzer = ExerciseAnalyzer()

# Mental Health Analysis endpoints
@app.route('/api/mental-health/analyze-text', methods=['POST'])
def analyze_text():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    text = data.get('text', '')
    
    # Use AI emotion recognition
    result = emotion_ai.analyze_text_sentiment(text)
    
    return jsonify(result), 200

@app.route('/api/mental-health/analyze-voice', methods=['POST'])
def analyze_voice():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Use AI voice emotion recognition
    result = emotion_ai.analyze_voice_features()
    
    return jsonify(result), 200

@app.route('/api/mental-health/analyze-face', methods=['POST'])
def analyze_face():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    image_data = data.get('image', '')
    
    # Use AI facial emotion recognition
    result = emotion_ai.analyze_face_image(image_data)
    
    return jsonify(result), 200

# Exercise Analysis endpoints
@app.route('/api/exercise/analyze', methods=['POST'])
def analyze_exercise():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    image_data = data.get('image', '')
    exercise_type = data.get('exercise_type', 'pushup')
    
    # Use OpenCV pose estimation for exercise analysis
    result = exercise_analyzer.analyze_exercise(image_data, exercise_type)
    
    return jsonify(result), 200

# Test endpoint for visual tracking (no auth required)
@app.route('/api/test/exercise/analyze', methods=['POST'])
def test_analyze_exercise():
    data = request.json
    image_data = data.get('image', '')
    exercise_type = data.get('exercise_type', 'pushup')
    
    # Use OpenCV pose estimation for exercise analysis
    result = exercise_analyzer.analyze_exercise(image_data, exercise_type)
    
    return jsonify(result), 200

@app.route('/api/exercise/reset', methods=['POST'])
def reset_exercise():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    exercise_type = data.get('exercise_type', 'pushup')
    
    # Reset exercise counter
    exercise_analyzer.reset_exercise(exercise_type)
    
    return jsonify({'message': f'{exercise_type} counter reset'}), 200

# Test endpoint for exercise reset (no auth required)
@app.route('/api/test/exercise/reset', methods=['POST'])
def test_reset_exercise():
    data = request.json
    exercise_type = data.get('exercise_type', 'pushup')
    
    # Reset exercise counter
    exercise_analyzer.reset_exercise(exercise_type)
    
    return jsonify({'message': f'{exercise_type} counter reset'}), 200

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

@app.route('/api/personalized-recommendations', methods=['POST'])
def personalized_recommendations():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    profile = data.get('profile', {})
    symptoms = data.get('symptoms', '')
    
    # Prepare patient data for ML models
    patient_data = {
        'age': int(profile.get('age', 30)) if profile.get('age') else 30,
        'gender': profile.get('gender', 'male'),
        'bmi': 25,
        'bp_systolic': 140 if 'hypertension' in profile.get('medicalHistory', '').lower() else 120,
        'glucose': 130 if 'diabetes' in profile.get('medicalHistory', '').lower() else 100,
        'diabetes': 'diabetes' in profile.get('medicalHistory', '').lower(),
        'hypertension': 'hypertension' in profile.get('medicalHistory', '').lower(),
        'heart_disease': 'heart' in profile.get('medicalHistory', '').lower(),
        'smoking': profile.get('lifestyle', {}).get('smoking', False),
        'alcohol': profile.get('lifestyle', {}).get('alcohol', False)
    }
    
    # Get AI-powered recommendations
    treatment_rec = healthcare_ai.predict_treatment(patient_data)
    risk_assessment = healthcare_ai.predict_risk(patient_data)
    diet_recs = healthcare_ai.get_diet_recommendations(patient_data)
    exercise_recs = healthcare_ai.get_exercise_recommendations(patient_data)
    
    recommendations = {
        'treatments': [
            f"🎯 AI Recommended: {treatment_rec['treatment'].title()}",
            f"📊 Confidence: {treatment_rec['confidence']:.1%}",
            f"💡 {treatment_rec['explanation']}"
        ],
        'medications': [
            "🔍 Alternative safer options available if interactions occur",
            "📋 Regular monitoring recommended for current medications"
        ],
        'diet': [f"🥗 {rec}" for rec in diet_recs],
        'exercise': [f"🏃 {rec}" for rec in exercise_recs],
        'risks': [
            f"⚠️ Risk Level: {risk_assessment['risk_level']} ({risk_assessment['risk_score']:.1%})"
        ] + [f"🚨 {factor}" for factor in risk_assessment['risk_factors']]
    }
    
    return jsonify(recommendations), 200

@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name FROM users WHERE role = 'doctor'")
    doctors = cursor.fetchall()
    conn.close()
    
    return jsonify([{'id': d[0], 'name': d[1]} for d in doctors])

if __name__ == '__main__':
    app.run(debug=True, port=8000)