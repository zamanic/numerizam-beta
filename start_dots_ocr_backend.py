#!/usr/bin/env python3
"""
Startup script for DotsOCR Backend Service

This script starts the Flask-based DotsOCR service that integrates with the dots.ocr library.
It handles environment setup, dependency checking, and service initialization.
"""

import os
import sys
import subprocess
import time
import requests
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = [
        'flask',
        'flask_cors',
        'PIL',
        'werkzeug'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package} is installed")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package} is missing")
    
    if missing_packages:
        print(f"\n📦 Installing missing packages: {', '.join(missing_packages)}")
        try:
            subprocess.check_call([
                sys.executable, '-m', 'pip', 'install', '-r', 'backend/requirements.txt'
            ])
            print("✅ Dependencies installed successfully")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install dependencies: {e}")
            sys.exit(1)

def check_dots_ocr():
    """Check if dots.ocr is available"""
    dots_ocr_path = Path('dots.ocr')
    if not dots_ocr_path.exists():
        print("❌ dots.ocr directory not found")
        print("Please ensure dots.ocr is installed in the project root")
        return False
    
    # Check for key files
    key_files = [
        'dots.ocr/dots_ocr/__init__.py',
        'dots.ocr/dots_ocr/parser.py'
    ]
    
    for file_path in key_files:
        if not Path(file_path).exists():
            print(f"❌ Required file not found: {file_path}")
            return False
    
    print("✅ dots.ocr installation verified")
    return True

def start_backend_service():
    """Start the DotsOCR backend service"""
    backend_script = Path('backend/dots_ocr_service.py')
    
    if not backend_script.exists():
        print("❌ Backend service script not found")
        sys.exit(1)
    
    print("🚀 Starting DotsOCR Backend Service...")
    
    # Set environment variables
    env = os.environ.copy()
    env['PYTHONPATH'] = str(Path.cwd())
    env['PORT'] = '5001'
    env['DEBUG'] = 'True'
    
    try:
        # Start the service
        process = subprocess.Popen([
            sys.executable, str(backend_script)
        ], env=env)
        
        # Wait a moment for the service to start
        time.sleep(3)
        
        # Check if service is running
        try:
            response = requests.get('http://localhost:5001/health', timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ DotsOCR Backend Service is running on port 5001")
                print(f"   Status: {data.get('status')}")
                print(f"   DotsOCR Available: {data.get('dots_ocr_available')}")
                return process
            else:
                print(f"❌ Service health check failed: {response.status_code}")
        except requests.RequestException as e:
            print(f"❌ Failed to connect to service: {e}")
        
        # If we get here, the service didn't start properly
        process.terminate()
        return None
        
    except Exception as e:
        print(f"❌ Failed to start backend service: {e}")
        return None

def main():
    """Main startup function"""
    print("🔧 DotsOCR Backend Service Startup")
    print("=" * 40)
    
    # Check system requirements
    check_python_version()
    
    # Check dependencies
    check_dependencies()
    
    # Check dots.ocr installation
    if not check_dots_ocr():
        print("\n❌ dots.ocr is not properly installed")
        print("Please install dots.ocr in the project root directory")
        sys.exit(1)
    
    # Start the backend service
    process = start_backend_service()
    
    if process:
        print("\n🎉 DotsOCR Backend Service started successfully!")
        print("\n📋 Service Information:")
        print("   URL: http://localhost:5001")
        print("   Health Check: http://localhost:5001/health")
        print("   Parse Endpoint: http://localhost:5001/parse")
        print("\n⚠️  Keep this terminal open to maintain the service")
        print("   Press Ctrl+C to stop the service")
        
        try:
            # Keep the service running
            process.wait()
        except KeyboardInterrupt:
            print("\n🛑 Stopping DotsOCR Backend Service...")
            process.terminate()
            process.wait()
            print("✅ Service stopped")
    else:
        print("\n❌ Failed to start DotsOCR Backend Service")
        sys.exit(1)

if __name__ == '__main__':
    main()