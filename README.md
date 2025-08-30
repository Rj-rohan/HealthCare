# 🏋️ AI-Powered Personalized Gym Trainer

A comprehensive AI-powered fitness application that combines **MediaPipe Pose Detection**, **Machine Learning**, and **Real-time Analysis** to provide personalized workout experiences with live visual tracking and form correction.

## 🚀 **Real-Time Features Implemented**

### **1. Live Visual Tracking with Colored Dots and Lines**
- **Real-time pose landmarks** with 33 body keypoints
- **Enhanced visualization** with custom colors and styling
- **Dynamic pose connections** showing body structure
- **Live camera analysis** with MediaPipe integration
- **Instant visual feedback** for exercise form

### **2. Instant Form Feedback with Voice Guidance**
- **AI-powered form analysis** using trained ML model
- **Real-time voice feedback** for form correction
- **Exercise-specific tips** and guidance
- **Form score calculation** (0-100%)
- **Instant corrections** during workout

### **3. Real-time Performance Metrics**
- **Live rep counting** using ML predictions
- **Form score tracking** in real-time
- **Calorie calculation** based on exercise intensity
- **Set completion tracking** with manual controls
- **Workout streak system** like LeetCode

### **4. Live Camera Analysis with MediaPipe Integration**
- **33 pose landmarks** detection in real-time
- **ML model predictions** for exercise states
- **Label smoothing** for consistent predictions
- **Real-time pose embedding** calculation
- **Enhanced visual tracking** with AI overlays

## 🧠 **ML Model Integration**

### **Trained Random Forest Classifier**
- **Exercise recognition** for 5+ exercise types
- **Real-time state prediction** (up/down positions)
- **Form analysis** using pose embeddings
- **Consistent predictions** with smoothing algorithms

### **Supported Exercises**
- **Push-ups** - Full range motion tracking
- **Squats** - Depth and form analysis
- **Sit-ups** - Core engagement monitoring
- **Jumping Jacks** - Rhythm and coordination
- **Pull-ups** - Upper body strength tracking

## 🎯 **How to Use - Real-Time Features**

### **1. Start Real-Time Analysis**
```
1. Click "▶️ Start Workout" → Camera activates
2. Select an exercise → ML model begins tracking
3. Exercise naturally → AI tracks you with dots and lines
4. Get live feedback → Voice guidance and form correction
```

### **2. Real-Time Visual Tracking**
- **Green dots** for key body landmarks
- **Magenta lines** connecting body parts
- **Live pose detection** with 33 points
- **Instant form analysis** and scoring
- **Real-time rep counting** using ML

### **3. AI-Powered Feedback System**
- **Form score updates** in real-time
- **Voice guidance** for corrections
- **Exercise-specific tips** displayed
- **Performance metrics** live updates
- **ML model status** indicators

## 🏗️ **Technical Architecture**

### **Backend (Python/Flask)**
- **MediaPipe Pose** for real-time detection
- **Trained ML model** (Random Forest)
- **Real-time analysis** with pose embeddings
- **Enhanced visualization** with OpenCV
- **RESTful API** for frontend communication

### **Frontend (React)**
- **Real-time video processing** with WebRTC
- **Live ML predictions** display
- **Enhanced UI** with real-time metrics
- **Voice synthesis** for feedback
- **Responsive design** for all devices

### **ML Pipeline**
- **Pose embedding** calculation
- **Feature extraction** (distances + angles)
- **Real-time prediction** using trained model
- **Label smoothing** for consistency
- **Form analysis** and scoring

## 📊 **Real-Time Performance Metrics**

### **Live Tracking**
- **FPS**: Real-time analysis (30+ fps)
- **Latency**: <100ms response time
- **Accuracy**: ML model predictions
- **Consistency**: Label smoothing algorithms

### **Visual Indicators**
- **🎯 AI Dots & Lines**: Live pose tracking
- **🤖 ML Model Status**: Real-time analysis
- **📊 Form Score**: Live performance metrics
- **⚡ Analysis Active**: Continuous monitoring

## 🔧 **Setup Instructions**

### **1. Backend Setup**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### **2. Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

### **3. ML Model Files**
- Copy `random_forest.joblib` to backend/
- Copy `label_encoder.joblib` to backend/
- Ensure MediaPipe and OpenCV are installed

## 🌟 **Key Features**

### **User Profile & Personalization**
- Age, gender, weight, height input
- Fitness goals (muscle gain, fat loss, endurance)
- Fitness level (beginner, intermediate, advanced)
- Personalized workout plans

### **Real-Time Exercise Recognition**
- **ML-powered detection** of exercise types
- **Live pose analysis** with MediaPipe
- **Automatic rep counting** using AI
- **Form correction** in real-time

### **Progress Tracking & Analytics**
- Daily workout streaks
- Exercise performance history
- Calorie tracking
- Form improvement over time

### **Enhanced User Experience**
- **Clean, professional interface**
- **Real-time performance indicators**
- **Voice guidance system**
- **Responsive design**

## 🎯 **Real-Time Workflow**

1. **Camera Activation** → Start workout session
2. **Exercise Selection** → Choose workout type
3. **ML Model Loading** → AI analysis begins
4. **Real-Time Tracking** → Live pose detection
5. **Form Analysis** → Instant feedback
6. **Performance Metrics** → Live updates
7. **Voice Guidance** → Real-time corrections

## 🚀 **Performance Benefits**

- **Real-time analysis** with <100ms latency
- **Accurate pose detection** using MediaPipe
- **Consistent predictions** with ML smoothing
- **Enhanced visualization** with custom styling
- **Professional-grade** tracking accuracy

## 🔮 **Future Enhancements**

- **More exercise types** support
- **Advanced form analysis** algorithms
- **Multi-person tracking** support
- **Integration with fitness devices**
- **Advanced analytics** and insights

---

**🎉 Experience the future of AI-powered fitness training with real-time pose detection, ML analysis, and instant feedback!**