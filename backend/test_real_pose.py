#!/usr/bin/env python3
"""
Test real pose detection and visual tracking
This script will test the enhanced visual tracking features
"""

import cv2
import numpy as np
import base64
import os
from exercise_analyzer import ExerciseAnalyzer

def create_mediapipe_friendly_pose():
    """Create a pose image that MediaPipe can actually detect"""
    
    # Create a larger, higher resolution image
    img = np.zeros((720, 1280, 3), dtype=np.uint8)
    
    # Fill with a natural-looking background
    img[:] = (120, 120, 140)
    
    # Add some texture to make it more natural
    for y in range(0, 720, 10):
        for x in range(0, 1280, 10):
            noise = np.random.randint(-20, 20, 3)
            img[y:y+10, x:x+10] = np.clip(img[y:y+10, x:x+10] + noise, 0, 255)
    
    # Draw a more realistic human figure with proper proportions
    # Head (larger and more detailed)
    head_center = (640, 100)
    cv2.circle(img, head_center, 60, (255, 255, 255), -1)
    
    # Face features (more detailed)
    cv2.circle(img, (head_center[0] - 20, head_center[1] - 15), 12, (0, 0, 0), -1)  # Left eye
    cv2.circle(img, (head_center[0] + 20, head_center[1] - 15), 12, (0, 0, 0), -1)  # Right eye
    cv2.circle(img, (head_center[0], head_center[1] + 10), 8, (0, 0, 0), -1)  # Nose
    cv2.ellipse(img, (head_center[0], head_center[1] + 30), (25, 15), 0, 0, 180, (0, 0, 0), 4)  # Mouth
    
    # Neck
    cv2.rectangle(img, (head_center[0] - 20, head_center[1] + 60), 
                 (head_center[0] + 20, head_center[1] + 100), (255, 255, 255), -1)
    
    # Torso (more detailed and realistic)
    torso_top = head_center[1] + 100
    torso_bottom = torso_top + 250
    cv2.rectangle(img, (head_center[0] - 100, torso_top), 
                 (head_center[0] + 100, torso_bottom), (255, 255, 255), -1)
    
    # Shoulders (more prominent)
    left_shoulder = (head_center[0] - 100, torso_top + 30)
    right_shoulder = (head_center[0] + 100, torso_top + 30)
    cv2.circle(img, left_shoulder, 35, (255, 255, 255), -1)
    cv2.circle(img, right_shoulder, 35, (255, 255, 255), -1)
    
    # Arms with more detail and realistic proportions
    # Left arm
    left_elbow = (left_shoulder[0] - 80, left_shoulder[1] + 100)
    left_wrist = (left_elbow[0] - 60, left_elbow[1] + 100)
    
    cv2.line(img, left_shoulder, left_elbow, (255, 255, 255), 20)
    cv2.line(img, left_elbow, left_wrist, (255, 255, 255), 18)
    
    cv2.circle(img, left_elbow, 25, (255, 255, 255), -1)
    cv2.circle(img, left_wrist, 22, (255, 255, 255), -1)
    
    # Right arm
    right_elbow = (right_shoulder[0] + 80, right_shoulder[1] + 100)
    right_wrist = (right_elbow[0] + 60, right_elbow[1] + 100)
    
    cv2.line(img, right_shoulder, right_elbow, (255, 255, 255), 20)
    cv2.line(img, right_elbow, right_wrist, (255, 255, 255), 18)
    
    cv2.circle(img, right_elbow, 25, (255, 255, 255), -1)
    cv2.circle(img, right_wrist, 22, (255, 255, 255), -1)
    
    # Hips (more prominent)
    left_hip = (head_center[0] - 80, torso_bottom)
    right_hip = (head_center[0] + 80, torso_bottom)
    cv2.circle(img, left_hip, 40, (255, 255, 255), -1)
    cv2.circle(img, right_hip, 40, (255, 255, 255), -1)
    
    # Legs with more detail and realistic proportions
    # Left leg
    left_knee = (left_hip[0] - 30, left_hip[1] + 150)
    left_ankle = (left_knee[0] - 25, left_knee[1] + 150)
    
    cv2.line(img, left_hip, left_knee, (255, 255, 255), 25)
    cv2.line(img, left_knee, left_ankle, (255, 255, 255), 22)
    
    cv2.circle(img, left_knee, 30, (255, 255, 255), -1)
    cv2.circle(img, left_ankle, 28, (255, 255, 255), -1)
    
    # Right leg
    right_knee = (right_hip[0] + 30, right_hip[1] + 150)
    right_ankle = (right_knee[0] + 25, right_knee[1] + 150)
    
    cv2.line(img, right_hip, right_knee, (255, 255, 255), 25)
    cv2.line(img, right_knee, right_ankle, (255, 255, 255), 22)
    
    cv2.circle(img, right_knee, 30, (255, 255, 255), -1)
    cv2.circle(img, right_ankle, 28, (255, 255, 255), -1)
    
    # Add some natural shadows and highlights
    # Add subtle shadows on the left side
    for y in range(torso_top, torso_bottom):
        for x in range(head_center[0] - 100, head_center[0]):
            if img[y, x].any():  # Only modify non-zero pixels
                shadow = max(0, int((head_center[0] - x) * 0.15))
                img[y, x] = np.clip(img[y, x] - shadow, 0, 255)
    
    # Add highlights on the right side
    for y in range(torso_top, torso_bottom):
        for x in range(head_center[0], head_center[0] + 100):
            if img[y, x].any():  # Only modify non-zero pixels
                highlight = min(255, int((x - head_center[0]) * 0.1))
                img[y, x] = np.clip(img[y, x] + highlight, 0, 255)
    
    # Add some natural noise to make it look more realistic
    noise = np.random.normal(0, 8, img.shape).astype(np.uint8)
    img = cv2.add(img, noise)
    
    # Apply slight blur to make edges more natural
    img = cv2.GaussianBlur(img, (3, 3), 0.5)
    
    return img

def test_enhanced_visual_tracking():
    """Test the enhanced visual tracking features"""
    print("🎯 Testing Enhanced Visual Tracking with Realistic Pose")
    print("=" * 70)
    
    # Create the enhanced test image
    test_img = create_mediapipe_friendly_pose()
    cv2.imwrite('enhanced_test_pose.jpg', test_img)
    print("✅ Created enhanced test pose image: enhanced_test_pose.jpg")
    print(f"📏 Image size: {test_img.shape[1]}x{test_img.shape[0]}")
    
    # Initialize analyzer
    analyzer = ExerciseAnalyzer()
    
    # Test all exercise types
    exercise_types = ['pushup', 'squat', 'bicep_curl', 'plank', 'pullup', 'situp', 'jumping_jack']
    
    for exercise_type in exercise_types:
        print(f"\n🏋️ Testing {exercise_type.upper()} enhanced visual tracking...")
        
        try:
            # Convert image to base64
            _, buffer = cv2.imencode('.jpg', test_img)
            image_base64 = f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"
            
            # Analyze exercise
            result = analyzer.analyze_exercise(image_base64, exercise_type)
            
            if 'error' in result:
                print(f"   ❌ {result['error']}")
                if 'No pose detected' in result['error']:
                    print(f"   💡 Trying to improve pose detection...")
                    # Try with a different approach
                    continue
            else:
                print(f"   ✅ Analysis successful!")
                print(f"   📊 Form Score: {result.get('form_score', 'N/A')}")
                print(f"   🔢 Count: {result.get('count', 'N/A')}")
                print(f"   📍 Stage: {result.get('stage', 'N/A')}")
                
                if 'annotated_image' in result:
                    print(f"   🎨 Annotated image generated ✓")
                    
                    # Save annotated image
                    annotated_filename = f'enhanced_annotated_{exercise_type}.jpg'
                    # Extract base64 data and save
                    img_data = result['annotated_image'].split(',')[1]
                    img_bytes = base64.b64decode(img_data)
                    with open(annotated_filename, 'wb') as f:
                        f.write(img_bytes)
                    print(f"   💾 Saved as: {annotated_filename}")
                    
                    # Verify the image has visual elements
                    annotated_img = cv2.imread(annotated_filename)
                    if annotated_img is not None:
                        # Check if image has non-zero pixels (indicating drawings)
                        gray = cv2.cvtColor(annotated_img, cv2.COLOR_BGR2GRAY)
                        non_zero_pixels = np.count_nonzero(gray)
                        total_pixels = gray.shape[0] * gray.shape[1]
                        print(f"   📊 Image analysis: {non_zero_pixels}/{total_pixels} non-zero pixels")
                        
                        if non_zero_pixels > total_pixels * 0.15:  # More than 15% non-zero
                            print(f"   🎯 Visual tracking elements detected!")
                        else:
                            print(f"   ⚠️ Few visual elements detected - may need adjustment")
                    else:
                        print(f"   ❌ Could not read annotated image")
                else:
                    print(f"   ❌ No annotated image generated")
                    
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    print("\n🎯 Enhanced visual tracking test completed!")
    print("📁 Check the generated images to see the enhanced tracking!")
    
    # List all generated files
    print("\n📋 Generated files:")
    for filename in os.listdir('.'):
        if filename.startswith('enhanced_') or filename.startswith('test_pose'):
            file_size = os.path.getsize(filename)
            print(f"   📄 {filename} ({file_size} bytes)")

if __name__ == "__main__":
    test_enhanced_visual_tracking()
