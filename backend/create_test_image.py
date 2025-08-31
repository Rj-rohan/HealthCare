#!/usr/bin/env python3
"""
Create a realistic test image for pose detection
This will generate an image that MediaPipe can actually detect poses from
"""

import cv2
import numpy as np
import os

def create_realistic_pose_image():
    """Create a more realistic pose image that MediaPipe can detect"""
    
    # Create a larger image with better resolution
    img = np.zeros((720, 1280, 3), dtype=np.uint8)
    
    # Create a gradient background
    for y in range(720):
        for x in range(1280):
            # Create a subtle gradient
            blue = 50 + int(y * 0.1)
            green = 50 + int(y * 0.05)
            red = 100 + int(x * 0.02)
            img[y, x] = [blue, green, red]
    
    # Draw a more realistic human figure with better proportions
    # Head (larger and more detailed)
    head_center = (640, 120)
    cv2.circle(img, head_center, 50, (255, 255, 255), -1)
    
    # Face features
    cv2.circle(img, (head_center[0] - 15, head_center[1] - 10), 8, (0, 0, 0), -1)  # Left eye
    cv2.circle(img, (head_center[0] + 15, head_center[1] - 10), 8, (0, 0, 0), -1)  # Right eye
    cv2.circle(img, (head_center[0], head_center[1] + 10), 5, (0, 0, 0), -1)  # Nose
    cv2.ellipse(img, (head_center[0], head_center[1] + 25), (20, 10), 0, 0, 180, (0, 0, 0), 3)  # Mouth
    
    # Neck
    cv2.rectangle(img, (head_center[0] - 15, head_center[1] + 50), 
                 (head_center[0] + 15, head_center[1] + 80), (255, 255, 255), -1)
    
    # Torso (more detailed)
    torso_top = head_center[1] + 80
    torso_bottom = torso_top + 200
    cv2.rectangle(img, (head_center[0] - 80, torso_top), 
                 (head_center[0] + 80, torso_bottom), (255, 255, 255), -1)
    
    # Shoulders
    left_shoulder = (head_center[0] - 80, torso_top + 20)
    right_shoulder = (head_center[0] + 80, torso_top + 20)
    cv2.circle(img, left_shoulder, 25, (255, 255, 255), -1)
    cv2.circle(img, right_shoulder, 25, (255, 255, 255), -1)
    
    # Arms with more detail
    # Left arm
    left_elbow = (left_shoulder[0] - 60, left_shoulder[1] + 80)
    left_wrist = (left_elbow[0] - 40, left_elbow[1] + 80)
    
    cv2.line(img, left_shoulder, left_elbow, (255, 255, 255), 15)
    cv2.line(img, left_elbow, left_wrist, (255, 255, 255), 12)
    
    cv2.circle(img, left_elbow, 20, (255, 255, 255), -1)
    cv2.circle(img, left_wrist, 18, (255, 255, 255), -1)
    
    # Right arm
    right_elbow = (right_shoulder[0] + 60, right_shoulder[1] + 80)
    right_wrist = (right_elbow[0] + 40, right_elbow[1] + 80)
    
    cv2.line(img, right_shoulder, right_elbow, (255, 255, 255), 15)
    cv2.line(img, right_elbow, right_wrist, (255, 255, 255), 12)
    
    cv2.circle(img, right_elbow, 20, (255, 255, 255), -1)
    cv2.circle(img, right_wrist, 18, (255, 255, 255), -1)
    
    # Hips
    left_hip = (head_center[0] - 60, torso_bottom)
    right_hip = (head_center[0] + 60, torso_bottom)
    cv2.circle(img, left_hip, 30, (255, 255, 255), -1)
    cv2.circle(img, right_hip, 30, (255, 255, 255), -1)
    
    # Legs with more detail
    # Left leg
    left_knee = (left_hip[0] - 20, left_hip[1] + 120)
    left_ankle = (left_knee[0] - 15, left_knee[1] + 120)
    
    cv2.line(img, left_hip, left_knee, (255, 255, 255), 20)
    cv2.line(img, left_knee, left_ankle, (255, 255, 255), 18)
    
    cv2.circle(img, left_knee, 25, (255, 255, 255), -1)
    cv2.circle(img, left_ankle, 22, (255, 255, 255), -1)
    
    # Right leg
    right_knee = (right_hip[0] + 20, right_hip[1] + 120)
    right_ankle = (right_knee[0] + 15, right_knee[1] + 120)
    
    cv2.line(img, right_hip, right_knee, (255, 255, 255), 20)
    cv2.line(img, right_knee, right_ankle, (255, 255, 255), 18)
    
    cv2.circle(img, right_knee, 25, (255, 255, 255), -1)
    cv2.circle(img, right_ankle, 22, (255, 255, 255), -1)
    
    # Add some texture and shadows to make it more realistic
    # Add subtle shadows
    for y in range(torso_top, torso_bottom):
        for x in range(head_center[0] - 80, head_center[0] + 80):
            if x < head_center[0]:  # Left side shadow
                shadow = max(0, int((head_center[0] - x) * 0.1))
                img[y, x] = [max(0, img[y, x][0] - shadow), 
                            max(0, img[y, x][1] - shadow), 
                            max(0, img[y, x][2] - shadow)]
    
    # Add some noise to make it look more natural
    noise = np.random.normal(0, 5, img.shape).astype(np.uint8)
    img = cv2.add(img, noise)
    
    return img

def main():
    """Main function to create and save test image"""
    print("🎨 Creating realistic test image for pose detection...")
    
    # Create the image
    test_img = create_realistic_pose_image()
    
    # Save the image
    output_path = "realistic_test_pose.jpg"
    cv2.imwrite(output_path, test_img)
    
    print(f"✅ Test image created: {output_path}")
    print(f"📏 Image size: {test_img.shape[1]}x{test_img.shape[0]}")
    print("🎯 This image should trigger MediaPipe pose detection!")
    
    # Display image info
    print(f"💾 File size: {os.path.getsize(output_path)} bytes")
    
    return output_path

if __name__ == "__main__":
    main()
