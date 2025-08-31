#!/usr/bin/env python3
"""
Demo script showing visual tracking capabilities
Creates a sample image and demonstrates pose landmark drawing
"""

import cv2
import numpy as np
import mediapipe as mp
from exercise_analyzer import ExerciseAnalyzer

def create_sample_pose_image():
    """Create a sample image with pose-like features"""
    # Create a larger image
    img = np.zeros((720, 1280, 3), dtype=np.uint8)
    
    # Add background gradient
    for y in range(720):
        for x in range(1280):
            img[y, x] = [50 + int(y * 0.1), 50 + int(y * 0.05), 100 + int(x * 0.02)]
    
    # Draw a stick figure to simulate pose
    # Head
    cv2.circle(img, (640, 150), 40, (255, 255, 255), -1)
    
    # Torso
    cv2.line(img, (640, 190), (640, 350), (255, 255, 255), 8)
    
    # Arms
    cv2.line(img, (640, 220), (540, 300), (255, 255, 255), 6)  # Left arm
    cv2.line(img, (640, 220), (740, 300), (255, 255, 255), 6)  # Right arm
    
    # Legs
    cv2.line(img, (640, 350), (580, 500), (255, 255, 255), 8)  # Left leg
    cv2.line(img, (640, 350), (700, 500), (255, 255, 255), 8)  # Right leg
    
    # Add some detail
    cv2.circle(img, (540, 300), 15, (255, 255, 255), -1)  # Left hand
    cv2.circle(img, (740, 300), 15, (255, 255, 255), -1)  # Right hand
    cv2.circle(img, (580, 500), 20, (255, 255, 255), -1)  # Left foot
    cv2.circle(img, (700, 500), 20, (255, 255, 255), -1)  # Right foot
    
    return img

def demo_visual_tracking():
    """Demonstrate visual tracking features"""
    print("🎨 Demo: Visual Tracking Features")
    print("=" * 50)
    
    # Create sample image
    sample_img = create_sample_pose_image()
    
    # Save original
    cv2.imwrite('sample_pose.jpg', sample_img)
    print("✅ Created sample pose image: sample_pose.jpg")
    
    # Initialize analyzer
    analyzer = ExerciseAnalyzer()
    
    # Test different exercise types
    exercise_types = ['pushup', 'squat', 'bicep_curl', 'plank', 'pullup', 'situp', 'jumping_jack']
    
    for exercise_type in exercise_types:
        print(f"\n🏋️ Testing {exercise_type.upper()} visual tracking...")
        
        try:
            # Convert image to base64
            _, buffer = cv2.imencode('.jpg', sample_img)
            import base64
            image_base64 = f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"
            
            # Analyze exercise
            result = analyzer.analyze_exercise(image_base64, exercise_type)
            
            if 'error' in result:
                print(f"   ❌ {result['error']}")
            else:
                print(f"   ✅ Analysis successful!")
                print(f"   📊 Form Score: {result.get('form_score', 'N/A')}")
                print(f"   🔢 Count: {result.get('count', 'N/A')}")
                print(f"   📍 Stage: {result.get('stage', 'N/A')}")
                
                if 'annotated_image' in result:
                    print(f"   🎨 Annotated image generated ✓")
                    
                    # Save annotated image
                    annotated_filename = f'annotated_{exercise_type}.jpg'
                    # Extract base64 data and save
                    img_data = result['annotated_image'].split(',')[1]
                    img_bytes = base64.b64decode(img_data)
                    with open(annotated_filename, 'wb') as f:
                        f.write(img_bytes)
                    print(f"   💾 Saved as: {annotated_filename}")
                else:
                    print(f"   ❌ No annotated image generated")
                    
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    print("\n🎯 Demo completed!")
    print("📁 Check the generated images to see visual tracking in action!")

if __name__ == "__main__":
    demo_visual_tracking()
