#!/usr/bin/env python3
"""
Test script for the Exercise Analyzer
Tests all exercise types and visual tracking features
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from exercise_analyzer import ExerciseAnalyzer
import cv2
import numpy as np
import base64

def test_exercise_analyzer():
    """Test the exercise analyzer with sample data"""
    print("🧪 Testing Exercise Analyzer...")
    
    # Initialize analyzer
    analyzer = ExerciseAnalyzer()
    
    # Create a sample image (black background with some shapes)
    test_image = np.zeros((480, 640, 3), dtype=np.uint8)
    
    # Add some basic shapes to simulate a person
    cv2.rectangle(test_image, (200, 100), (440, 380), (255, 255, 255), -1)
    cv2.circle(test_image, (320, 150), 30, (255, 255, 255), -1)
    
    # Convert to base64 properly
    _, buffer = cv2.imencode('.jpg', test_image)
    image_base64 = f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"
    
    # Test all exercise types
    exercise_types = ['pushup', 'squat', 'plank', 'bicep_curl', 'pullup', 'situp', 'jumping_jack']
    
    for exercise_type in exercise_types:
        print(f"\n🏋️ Testing {exercise_type.upper()}...")
        try:
            result = analyzer.analyze_exercise(image_base64, exercise_type)
            if 'error' in result:
                print(f"❌ {exercise_type}: {result['error']}")
            else:
                print(f"✅ {exercise_type}: Success!")
                print(f"   - Count: {result.get('count', 'N/A')}")
                print(f"   - Stage: {result.get('stage', 'N/A')}")
                print(f"   - Form Score: {result.get('form_score', 'N/A')}")
                print(f"   - Feedback: {result.get('feedback', 'N/A')}")
                if 'annotated_image' in result:
                    print(f"   - Annotated Image: Generated ✓")
        except Exception as e:
            print(f"❌ {exercise_type}: Exception - {str(e)}")
    
    # Test reset functionality
    print(f"\n🔄 Testing reset functionality...")
    try:
        analyzer.reset_exercise('pushup')
        analyzer.reset_exercise('squat')
        print("✅ Reset functionality working")
    except Exception as e:
        print(f"❌ Reset failed: {str(e)}")
    
    print("\n🎯 Exercise Analyzer test completed!")

if __name__ == "__main__":
    test_exercise_analyzer()
