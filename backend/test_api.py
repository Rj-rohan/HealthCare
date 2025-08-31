#!/usr/bin/env python3
"""
Test the exercise analysis API endpoint
"""

import requests
import cv2
import base64
import json

def test_exercise_api():
    """Test the exercise analysis API"""
    
    # Read the test image
    img = cv2.imread('enhanced_test_pose.jpg')
    if img is None:
        print("❌ Could not read test image")
        return
    
    # Convert to base64
    _, buffer = cv2.imencode('.jpg', img)
    image_base64 = f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"
    
    # Test data
    test_data = {
        "image": image_base64,
        "exercise_type": "pushup"
    }
    
    print("🧪 Testing exercise analysis API...")
    print(f"📏 Image size: {img.shape[1]}x{img.shape[0]}")
    
    try:
        # Test the test endpoint (no auth required)
        response = requests.post(
            'http://localhost:8000/api/test/exercise/analyze',
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ API call successful!")
            print(f"📊 Form Score: {result.get('form_score', 'N/A')}")
            print(f"🔢 Count: {result.get('count', 'N/A')}")
            print(f"📍 Stage: {result.get('stage', 'N/A')}")
            
            if 'annotated_image' in result:
                print("🎨 Annotated image received! ✓")
                
                # Save the annotated image
                img_data = result['annotated_image'].split(',')[1]
                img_bytes = base64.b64decode(img_data)
                with open('api_test_annotated.jpg', 'wb') as f:
                    f.write(img_bytes)
                print("💾 Saved annotated image as: api_test_annotated.jpg")
                
                # Check if it has visual elements
                annotated_img = cv2.imread('api_test_annotated.jpg')
                if annotated_img is not None:
                    gray = cv2.cvtColor(annotated_img, cv2.COLOR_BGR2GRAY)
                    non_zero_pixels = cv2.countNonZero(gray)
                    total_pixels = gray.shape[0] * gray.shape[1]
                    print(f"📊 Image analysis: {non_zero_pixels}/{total_pixels} non-zero pixels")
                    
                    if non_zero_pixels > total_pixels * 0.15:
                        print("🎯 Visual tracking elements detected! ✓")
                    else:
                        print("⚠️ Few visual elements detected")
                else:
                    print("❌ Could not read annotated image")
            else:
                print("❌ No annotated image in response")
        else:
            print(f"❌ API call failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_exercise_api()
