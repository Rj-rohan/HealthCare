#!/usr/bin/env python3
"""
Test script to verify visual tracking is working with exact reference implementation
"""

import cv2
import numpy as np
import mediapipe as mp
import base64
import io
from PIL import Image
import os

def test_visual_tracking():
    """Test the exact visual tracking implementation"""
    
    # Initialize MediaPipe Pose (EXACT reference settings)
    mp_pose = mp.solutions.pose
    mp_drawing = mp.solutions.drawing_utils
    
    pose = mp_pose.Pose(
        min_detection_confidence=0.5, 
        min_tracking_confidence=0.5
    )
    
    # Create a test image (or use webcam)
    print("🎥 Testing visual tracking...")
    
    # Try to open webcam
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Webcam not available, creating test image...")
        # Create a test image
        test_image = np.zeros((480, 640, 3), dtype=np.uint8)
        test_image[:] = (100, 100, 100)  # Gray background
        
        # Add some test content
        cv2.rectangle(test_image, (200, 150), (440, 330), (0, 255, 0), 2)
        cv2.putText(test_image, "Test Person", (220, 140), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        # Process test image
        results = pose.process(cv2.cvtColor(test_image, cv2.COLOR_BGR2RGB))
        
        if results.pose_landmarks:
            print("✅ Pose landmarks detected in test image!")
            # Draw landmarks with EXACT reference styling
            annotated_image = test_image.copy()
            
            mp_drawing.draw_landmarks(
                annotated_image,
                results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=mp_drawing.DrawingSpec(
                    color=(245, 117, 66), thickness=2, circle_radius=2  # Orange dots
                ),
                connection_drawing_spec=mp_drawing.DrawingSpec(
                    color=(245, 66, 230), thickness=2  # Magenta lines
                )
            )
            
            # Save test result
            cv2.imwrite('test_visual_tracking_result.jpg', annotated_image)
            print("✅ Visual tracking test completed! Check 'test_visual_tracking_result.jpg'")
            
        else:
            print("❌ No pose detected in test image")
            
    else:
        print("✅ Webcam available! Testing live visual tracking...")
        
        # Test live webcam
        ret, frame = cap.read()
        if ret:
            # Process frame
            results = pose.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            
            if results.pose_landmarks:
                print("✅ Live pose detection working!")
                
                # Draw landmarks with EXACT reference styling
                annotated_frame = frame.copy()
                
                mp_drawing.draw_landmarks(
                    annotated_frame,
                    results.pose_landmarks,
                    mp_pose.POSE_CONNECTIONS,
                    landmark_drawing_spec=mp_drawing.DrawingSpec(
                        color=(245, 117, 66), thickness=2, circle_radius=2  # Orange dots
                    ),
                    connection_drawing_spec=mp_drawing.DrawingSpec(
                        color=(245, 66, 230), thickness=2  # Magenta lines
                    )
                )
                
                # Save live test result
                cv2.imwrite('live_visual_tracking_test.jpg', annotated_frame)
                print("✅ Live visual tracking test completed! Check 'live_visual_tracking_test.jpg'")
                
                # Show live preview
                cv2.imshow('Visual Tracking Test', annotated_frame)
                print("🖥️ Press 'q' to close preview...")
                cv2.waitKey(0)
                
            else:
                print("❌ No pose detected in live frame")
        
        cap.release()
        cv2.destroyAllWindows()
    
    pose.close()
    print("🎯 Visual tracking test completed!")

if __name__ == "__main__":
    test_visual_tracking()
