import cv2
import numpy as np
import mediapipe as mp
import base64
import io
from PIL import Image
import joblib
import os
from collections import deque, Counter

class ExerciseAnalyzer:
    def __init__(self):
        # Initialize MediaPipe Pose
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        # Load the trained ML model and label encoder
        model_path = os.path.join(os.path.dirname(__file__), 'random_forest.joblib')
        encoder_path = os.path.join(os.path.dirname(__file__), 'label_encoder.joblib')
        
        if os.path.exists(model_path) and os.path.exists(encoder_path):
            self.random_forest_classifier = joblib.load(model_path)
            self.label_encoder = joblib.load(encoder_path)
            self.ml_model_loaded = True
            print("✅ ML model and label encoder loaded successfully!")
        else:
            self.ml_model_loaded = False
            print("⚠️ ML model files not found. Using basic pose detection only.")
        
        # Initialize pose embedder
        self.pose_embedder = FullBodyPoseEmbedder()
        
        # Exercise state tracking
        self.exercise_states = {
            'pushups': 'down',
            'squats': 'down', 
            'situps': 'down',
            'jumping_jacks': 'down',
            'pullups': 'down'
        }
        
        # Exercise counters
        self.exercise_counters = {
            'pushups': 0,
            'squats': 0,
            'situps': 0,
            'jumping_jacks': 0,
            'pullups': 0
        }
        
        # Label smoothing window
        self.label_window = deque(maxlen=35)
        
        # Exercise-specific feedback
        self.exercise_feedback = {
            'pushups': {
                'up': 'Great form! Keep your back straight and lower slowly.',
                'down': 'Lower your body until your chest nearly touches the ground.',
                'form_tips': ['Keep your core tight', 'Maintain a straight line from head to heels', 'Breathe steadily']
            },
            'squats': {
                'up': 'Excellent depth! Keep your chest up and knees behind toes.',
                'down': 'Lower until your thighs are parallel to the ground.',
                'form_tips': ['Keep your chest up', 'Knees behind toes', 'Weight in your heels']
            },
            'situps': {
                'up': 'Good control! Keep your feet flat and engage your core.',
                'down': 'Lower your upper body back to the starting position.',
                'form_tips': ['Keep your feet flat', 'Engage your core', 'Don\'t pull on your neck']
            },
            'jumping_jacks': {
                'up': 'Great rhythm! Keep your arms and legs coordinated.',
                'down': 'Jump back to starting position with control.',
                'form_tips': ['Land softly', 'Keep your core engaged', 'Maintain rhythm']
            },
            'pullups': {
                'up': 'Excellent pull! Keep your shoulders back and chest up.',
                'down': 'Lower yourself with control to full extension.',
                'form_tips': ['Keep your core tight', 'Pull with your back muscles', 'Full range of motion']
            }
        }

    def analyze_exercise(self, image_data, exercise_type):
        """Analyze exercise using the trained ML model and MediaPipe"""
        try:
            # Decode base64 image
            image_bytes = base64.b64decode(image_data.split(',')[1])
            image = Image.open(io.BytesIO(image_bytes))
            image_np = np.array(image)
            
            # Convert to BGR for OpenCV
            if len(image_np.shape) == 3:
                image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
            else:
                image_bgr = image_np
            
            # Process with MediaPipe (EXACT reference settings)
            with self.mp_pose.Pose(
                min_detection_confidence=0.5, 
                min_tracking_confidence=0.5
            ) as pose:
                # Convert to RGB for MediaPipe
                image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
                results = pose.process(image_rgb)
                
                if results.pose_landmarks:
                    # Extract pose landmarks
                    pose_landmarks = np.array([[lmk.x, lmk.y, lmk.z] for lmk in results.pose_landmarks.landmark], dtype=np.float32)
                    
                    if pose_landmarks.shape == (33, 3):
                        # Get pose embeddings
                        landmarks, distance_embedding, distance3D_embedding, angle_embedding = self.pose_embedder(pose_landmarks)
                        
                        # Combine features for ML model
                        features = np.concatenate((distance3D_embedding, angle_embedding), axis=0)
                        features = np.reshape(features, (1, features.size))
                        
                        # Predict exercise state using ML model
                        if self.ml_model_loaded:
                            label_numeric = self.random_forest_classifier.predict(features)
                            predicted_label = self.label_encoder.inverse_transform(label_numeric)[0]
                            
                            # Add to smoothing window
                            self.label_window.append(predicted_label)
                            most_common_label = Counter(self.label_window).most_common(1)[0][0]
                            
                            # Update exercise counters and states
                            self._update_exercise_tracking(most_common_label)
                            
                            # Get current exercise info
                            current_exercise = self._get_current_exercise(most_common_label)
                            current_count = self.exercise_counters.get(current_exercise, 0)
                            
                            # Generate feedback
                            feedback = self._generate_feedback(most_common_label, current_exercise)
                            form_score = self._calculate_form_score(most_common_label, current_exercise)
                            
                            # Draw pose landmarks with enhanced visualization
                            annotated_image = self._draw_pose_landmarks(image_bgr, results.pose_landmarks, most_common_label, current_count)
                            
                            return {
                                'success': True,
                                'exercise_type': current_exercise,
                                'current_state': most_common_label,
                                'rep_count': current_count,
                                'feedback': feedback,
                                'form_score': form_score,
                                'annotated_image': base64.b64encode(cv2.imencode('.jpg', annotated_image)[1]).decode('utf-8'),
                                'keypoints': self._extract_keypoints(pose_landmarks)
                            }
                        else:
                            # Fallback to basic pose detection
                            return self._basic_pose_analysis(image_bgr, results.pose_landmarks, exercise_type)
                    else:
                        return {'success': False, 'error': 'Invalid pose landmarks shape'}
                else:
                    return {'success': False, 'error': 'No pose detected'}
                    
        except Exception as e:
            print(f"Error in exercise analysis: {str(e)}")
            return {'success': False, 'error': str(e)}

    def _update_exercise_tracking(self, label):
        """Update exercise counters and states based on ML predictions"""
        exercise_mappings = {
            'pushups_up': ('pushups', 'up'),
            'pushups_down': ('pushups', 'down'),
            'squats_up': ('squats', 'up'),
            'squats_down': ('squats', 'down'),
            'situps_up': ('situps', 'up'),
            'situp_down': ('situps', 'down'),
            'jumping_jacks_up': ('jumping_jacks', 'up'),
            'jumping_jacks_down': ('jumping_jacks', 'down'),
            'pullups_up': ('pullups', 'up'),
            'pullups_down': ('pullups', 'down')
        }
        
        if label in exercise_mappings:
            exercise, state = exercise_mappings[label]
            prev_state = self.exercise_states[exercise]
            
            # Update state
            self.exercise_states[exercise] = state
            
            # Increment counter when transitioning from up to down
            if prev_state == 'up' and state == 'down':
                self.exercise_counters[exercise] += 1

    def _get_current_exercise(self, label):
        """Extract exercise name from label"""
        for exercise in self.exercise_counters.keys():
            if exercise in label:
                return exercise
        return 'unknown'

    def _generate_feedback(self, label, exercise):
        """Generate real-time feedback based on exercise state"""
        if exercise in self.exercise_feedback:
            if 'up' in label:
                return self.exercise_feedback[exercise]['up']
            elif 'down' in label:
                return self.exercise_feedback[exercise]['down']
        
        return "Keep going! Maintain good form."

    def _calculate_form_score(self, label, exercise):
        """Calculate form score based on exercise state and consistency"""
        base_score = 85
        
        # Bonus for consistent form
        if len(self.label_window) > 10:
            recent_labels = list(self.label_window)[-10:]
            consistency = len(set(recent_labels)) / len(recent_labels)
            base_score += int(consistency * 15)
        
        return min(100, base_score)

    def _draw_pose_landmarks(self, image, pose_landmarks, current_label, rep_count):
        """Draw enhanced pose landmarks with exercise information using EXACT reference styling"""
        # Create a copy for drawing
        annotated_image = image.copy()
        
        # Draw pose landmarks with EXACT reference styling (orange dots, magenta lines)
        self.mp_drawing.draw_landmarks(
            annotated_image,
            pose_landmarks,
            self.mp_pose.POSE_CONNECTIONS,
            landmark_drawing_spec=self.mp_drawing.DrawingSpec(
                color=(245, 117, 66), thickness=2, circle_radius=2  # Orange dots (BGR: 66, 117, 245)
            ),
            connection_drawing_spec=self.mp_drawing.DrawingSpec(
                color=(245, 66, 230), thickness=2  # Magenta lines (BGR: 230, 66, 245)
            )
        )
        
        # Add exercise information overlay (same as reference)
        exercise = self._get_current_exercise(current_label)
        if exercise:
            # Display the counter for the current exercise (exact reference style)
            cv2.putText(annotated_image, f"{exercise.title()}: {rep_count}", (50, 100), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
        
        # Add current exercise state
        cv2.putText(annotated_image, current_label, (50, 50), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2, cv2.LINE_AA)
        
        return annotated_image

    def _extract_keypoints(self, pose_landmarks):
        """Extract key pose keypoints for frontend visualization"""
        keypoints = {}
        landmark_names = [
            'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
            'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
            'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
            'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
        ]
        
        for i, name in enumerate(landmark_names):
            if i < len(pose_landmarks):
                keypoints[name] = {
                    'x': float(pose_landmarks[i][0]),
                    'y': float(pose_landmarks[i][1]),
                    'z': float(pose_landmarks[i][2])
                }
        
        return keypoints

    def _basic_pose_analysis(self, image, pose_landmarks, exercise_type):
        """Fallback pose analysis when ML model is not available - with EXACT visual tracking"""
        # Draw pose landmarks with EXACT reference styling
        annotated_image = image.copy()
        
        # Draw pose landmarks with EXACT reference styling (orange dots, magenta lines)
        self.mp_drawing.draw_landmarks(
            annotated_image,
            pose_landmarks,
            self.mp_pose.POSE_CONNECTIONS,
            landmark_drawing_spec=self.mp_drawing.DrawingSpec(
                color=(245, 117, 66), thickness=2, circle_radius=2  # Orange dots (BGR: 66, 117, 245)
            ),
            connection_drawing_spec=self.mp_drawing.DrawingSpec(
                color=(245, 66, 230), thickness=2  # Magenta lines (BGR: 230, 66, 245)
            )
        )
        
        # Add exercise information overlay (same as reference)
        cv2.putText(annotated_image, f"{exercise_type.title()}: 0", (50, 100), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
        cv2.putText(annotated_image, f"{exercise_type}_detected", (50, 50), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2, cv2.LINE_AA)
        
        return {
            'success': True,
            'exercise_type': exercise_type,
            'current_state': 'detected',
            'rep_count': 0,
            'feedback': 'Pose detected - ML model not available',
            'form_score': 70,
            'annotated_image': base64.b64encode(cv2.imencode('.jpg', annotated_image)[1]).decode('utf-8'),
            'keypoints': self._extract_keypoints(np.array([[lmk.x, lmk.y, lmk.z] for lmk in pose_landmarks.landmark]))
        }

    def reset_exercise(self, exercise_type):
        """Reset exercise counter for a specific exercise"""
        if exercise_type in self.exercise_counters:
            self.exercise_counters[exercise_type] = 0
            self.exercise_states[exercise_type] = 'down'
            return True
        return False

    def get_exercise_stats(self):
        """Get current exercise statistics"""
        return {
            'counters': self.exercise_counters.copy(),
            'states': self.exercise_states.copy(),
            'total_reps': sum(self.exercise_counters.values())
        }


class FullBodyPoseEmbedder:
    """Converts 3D pose landmarks into 3D embedding."""
    
    def __init__(self, torso_size_multiplier=2.5):
        self._torso_size_multiplier = torso_size_multiplier
        self._landmark_names = [
            'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer',
            'right_eye_inner', 'right_eye', 'right_eye_outer',
            'left_ear', 'right_ear', 'mouth_left', 'mouth_right',
            'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
            'left_wrist', 'right_wrist', 'left_pinky_1', 'right_pinky_1',
            'left_index_1', 'right_index_1', 'left_thumb_2', 'right_thumb_2',
            'left_hip', 'right_hip', 'left_knee', 'right_knee',
            'left_ankle', 'right_ankle', 'left_heel', 'right_heel',
            'left_foot_index', 'right_foot_index',
        ]

    def __call__(self, landmarks):
        """Normalizes pose landmarks and converts to embedding"""
        assert landmarks.shape[0] == len(self._landmark_names)
        
        landmarks = np.copy(landmarks)
        landmarks = self._normalize_pose_landmarks(landmarks)
        
        distance_embedding = self._get_pose_distance_embedding(landmarks)
        angle_embedding = self._get_pose_angle_embedding(landmarks)
        distance3D_embedding = self._get_pose_3Ddistance_embedding(landmarks)
        
        return landmarks, distance_embedding, distance3D_embedding, angle_embedding

    def _normalize_pose_landmarks(self, landmarks):
        """Normalizes landmarks translation and scale."""
        landmarks = np.copy(landmarks)
        
        # Normalize translation
        pose_center = self._get_pose_center(landmarks)
        landmarks -= pose_center
        
        # Normalize scale
        pose_size = self._get_pose_size(landmarks, self._torso_size_multiplier)
        landmarks /= pose_size
        landmarks *= 100
        
        return landmarks

    def _get_pose_center(self, landmarks):
        """Calculates pose center as point between hips."""
        left_hip = landmarks[self._landmark_names.index('left_hip')]
        right_hip = landmarks[self._landmark_names.index('right_hip')]
        center = (left_hip + right_hip) * 0.5
        return center

    def _get_pose_size(self, landmarks, torso_size_multiplier):
        """Calculates pose size."""
        landmarks = landmarks[:, :2]
        hip_center = self._get_pose_center(landmarks)
        
        max_dist = 0
        for landmark in landmarks:
            dist = np.linalg.norm(landmark - hip_center)
            if dist > max_dist:
                max_dist = dist
        
        torso_size = max_dist * torso_size_multiplier
        return max(torso_size, max_dist)

    def _get_pose_distance_embedding(self, landmarks):
        """Gets pose distance embedding."""
        embedding = np.array([
            self._get_distance_by_names(landmarks, 'left_shoulder', 'left_wrist')[1],
            self._get_distance_by_names(landmarks, 'right_shoulder', 'right_wrist')[1],
            self._get_distance_by_names(landmarks, 'left_hip', 'left_ankle')[1],
            self._get_distance_by_names(landmarks, 'right_hip', 'right_ankle')[1],
            self._get_distance_by_names(landmarks, 'left_hip', 'left_wrist')[1],
            self._get_distance_by_names(landmarks, 'right_hip', 'right_wrist')[1],
            self._get_distance_by_names(landmarks, 'left_shoulder', 'left_ankle')[1],
            self._get_distance_by_names(landmarks, 'right_shoulder', 'right_ankle')[1],
            self._get_distance_by_names(landmarks, 'left_hip', 'right_wrist')[1],
            self._get_distance_by_names(landmarks, 'right_hip', 'left_wrist')[1],
            self._get_distance_by_names(landmarks, 'left_elbow', 'right_elbow')[1],
            self._get_distance_by_names(landmarks, 'left_knee', 'right_knee')[1],
            self._get_distance_by_names(landmarks, 'left_wrist', 'right_wrist')[1],
            self._get_distance_by_names(landmarks, 'left_ankle', 'right_ankle')[1],
        ])
        return embedding

    def _get_pose_angle_embedding(self, landmarks):
        """Gets pose angle embedding."""
        angle_embedding = np.array([
            self._get_angle_by_names(landmarks, 'right_elbow', 'right_shoulder', 'right_hip'),
            self._get_angle_by_names(landmarks, 'left_elbow', 'left_shoulder', 'left_hip'),
            self._get_angle_by_names(landmarks, 'right_knee', 'mid_hip', 'left_knee'),
            self._get_angle_by_names(landmarks, 'right_hip', 'right_knee', 'right_ankle'),
            self._get_angle_by_names(landmarks, 'left_hip', 'left_knee', 'left_ankle'),
            self._get_angle_by_names(landmarks, 'right_wrist', 'right_elbow', 'right_shoulder'),
            self._get_angle_by_names(landmarks, 'left_wrist', 'left_elbow', 'left_shoulder')
        ])
        return angle_embedding

    def _get_pose_3Ddistance_embedding(self, landmarks):
        """Gets 3D pose distance embedding."""
        embedding_3d = np.array([
            self._get_distance_by_names(landmarks, 'left_shoulder', 'left_wrist')[1],
            self._get_distance_by_names(landmarks, 'right_shoulder', 'right_wrist')[1],
            self._get_distance_by_names(landmarks, 'left_hip', 'left_ankle')[1],
            self._get_distance_by_names(landmarks, 'right_hip', 'right_ankle')[1],
            self._get_distance_by_names(landmarks, 'left_hip', 'left_wrist')[1],
            self._get_distance_by_names(landmarks, 'right_hip', 'right_wrist')[1],
            self._get_distance_by_names(landmarks, 'left_shoulder', 'left_ankle')[1],
            self._get_distance_by_names(landmarks, 'right_shoulder', 'right_ankle')[1],
            self._get_distance_by_names(landmarks, 'left_hip', 'right_wrist')[1],
            self._get_distance_by_names(landmarks, 'right_hip', 'left_wrist')[1],
            self._get_distance_by_names(landmarks, 'left_elbow', 'right_elbow')[1],
            self._get_distance_by_names(landmarks, 'left_knee', 'right_knee')[1],
            self._get_distance_by_names(landmarks, 'left_wrist', 'right_wrist')[1],
            self._get_distance_by_names(landmarks, 'left_ankle', 'right_ankle')[1],
        ])
        return embedding_3d

    def _get_distance_by_names(self, landmarks, name_from, name_to):
        """Gets distance between two landmarks by name."""
        try:
            lmk_from = landmarks[self._landmark_names.index(name_from)]
            lmk_to = landmarks[self._landmark_names.index(name_to)]
            return self._get_distance(lmk_from, lmk_to)[0], self._get_distance(lmk_from, lmk_to)[1]
        except ValueError:
            return np.array([0, 0]), np.array([0, 0])

    def _get_distance(self, lmk_from, lmk_to):
        """Gets distance between two landmarks."""
        squared_dist = np.sum((lmk_from - lmk_to) ** 2, axis=0)
        dist_3D = np.sqrt(squared_dist)
        return self._get_distance(lmk_from, lmk_to)[0], self._get_distance(lmk_from, lmk_to)[1]

    def _get_angle_by_names(self, landmarks, name_from, name_mid, name_to):
        """Gets angle between three landmarks by name."""
        try:
            lmk_from = landmarks[self._landmark_names.index(name_from)]
            lmk_mid = landmarks[self._landmark_names.index(name_mid)]
            lmk_to = landmarks[self._landmark_names.index(name_to)]
            return self._get_angle(lmk_from, lmk_mid, lmk_to)
        except ValueError:
            return 0.0

    def _get_angle(self, lmk_from, lmk_mid, lmk_to):
        """Gets angle between three landmarks."""
        v1 = lmk_from - lmk_mid
        v2 = lmk_to - lmk_mid
        
        cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
        angle = np.arccos(np.clip(cos_angle, -1.0, 1.0))
        return np.degrees(angle)