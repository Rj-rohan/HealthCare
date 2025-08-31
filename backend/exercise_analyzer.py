import base64
import cv2
import numpy as np
import mediapipe as mp

class ExerciseAnalyzer:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            enable_segmentation=False,
            min_detection_confidence=0.5
        )
        self.rep_counts = {}
    
    def analyze_exercise(self, image_data, exercise_type):
        try:
            # Decode base64 image
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return {'error': 'Invalid image data'}
            
            # Convert BGR to RGB
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Process with MediaPipe
            results = self.pose.process(rgb_image)
            
            response = {
                'pose_detected': results.pose_landmarks is not None,
                'exercise_type': exercise_type,
                'rep_count': self.rep_counts.get(exercise_type, 0),
                'form_score': 85,
                'feedback': 'Keep your form steady',
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
                response['feedback'] = 'Good form detected!'
                
                # Simple rep counting logic
                if exercise_type not in self.rep_counts:
                    self.rep_counts[exercise_type] = 0
                
                # Basic rep detection (simplified)
                if len(landmarks) > 0:
                    self.rep_counts[exercise_type] += 1
                    response['rep_count'] = self.rep_counts[exercise_type]
            
            return response
            
        except Exception as e:
            return {'error': str(e)}
    
    def reset_exercise(self, exercise_type):
        self.rep_counts[exercise_type] = 0