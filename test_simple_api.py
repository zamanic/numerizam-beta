#!/usr/bin/env python3

import requests
import os
from PIL import Image

def create_simple_test_image():
    """Create a very simple small test image"""
    # Create a small 200x200 white image with black text
    img = Image.new('RGB', (200, 200), color='white')
    
    # Save as PNG
    img.save('simple_test.png', 'PNG')
    print("Created simple_test.png (200x200 pixels)")
    return 'simple_test.png'

def test_simple_processing():
    """Test the backend API with a very simple small image"""
    image_path = create_simple_test_image()
    
    url = "http://localhost:5001/parse"
    
    try:
        with open(image_path, 'rb') as f:
            files = {'file': (image_path, f, 'image/png')}
            print(f"Sending {image_path} to {url}...")
            response = requests.post(url, files=files, timeout=30)
            
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Success!")
            result = response.json()
            print(f"Result keys: {list(result.keys())}")
            if 'text' in result:
                print(f"Extracted text: '{result['text']}'")
        else:
            print("❌ Error!")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")
    finally:
        # Clean up
        if os.path.exists(image_path):
            os.remove(image_path)

if __name__ == "__main__":
    test_simple_processing()