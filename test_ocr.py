import requests
import os

# Test the OCR service
url = 'http://localhost:5001/parse'
image_path = 'test_invoice_detailed.png'

if os.path.exists(image_path):
    with open(image_path, 'rb') as f:
        files = {'file': (image_path, f, 'image/png')}
        try:
            response = requests.post(url, files=files)
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            print(f"Response Text: {response.text}")
            try:
                json_response = response.json()
                print(f"Response JSON: {json_response}")
            except:
                print("Response is not valid JSON")
        except Exception as e:
            print(f"Error: {e}")
else:
    print(f"Image file {image_path} not found")