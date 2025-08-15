# DotsOCR Integration Setup Guide

This guide explains how to set up and use the real `dots.ocr` integration in the Numerizam application.

## Overview

The application now supports both:
1. **Real DotsOCR Processing** - Using the actual `dots.ocr` library through a Python backend service
2. **Simulation Fallback** - Realistic simulation when the real service is unavailable

## Prerequisites

### System Requirements
- Python 3.8 or higher
- Node.js 16+ (for the main application)
- At least 4GB RAM (for ML models)
- 2GB free disk space (for models and dependencies)

### Required Software
- Git
- Python pip
- Node.js and npm/yarn

## Installation Steps

### 1. Install Python Dependencies

```bash
# Navigate to the project root
cd Numerizam

# Install Python dependencies
pip install -r backend/requirements.txt
```

### 2. Verify DotsOCR Installation

Ensure the `dots.ocr` directory exists in your project root:

```
Numerizam/
├── dots.ocr/
│   ├── dots_ocr/
│   │   ├── __init__.py
│   │   ├── parser.py
│   │   └── ...
│   ├── demo/
│   └── ...
├── backend/
├── src/
└── ...
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update the DotsOCR settings:

```bash
cp .env.example .env
```

Key environment variables:
```env
# DotsOCR Backend Service
VITE_DOTS_OCR_ENDPOINT=http://localhost:5001/parse
VITE_DOTS_OCR_BACKEND_URL=http://localhost:5001
VITE_DOTS_OCR_ENABLE_MOCK=false

# Processing Settings
VITE_DOTS_OCR_TIMEOUT=60000
VITE_DOTS_OCR_MAX_FILE_SIZE=16777216

# Backend Service Settings
DOTS_OCR_BACKEND_PORT=5001
DOTS_OCR_BACKEND_DEBUG=true
```

## Running the DotsOCR Service

### Option 1: Using the Startup Script (Recommended)

**Windows:**
```bash
# Double-click or run from command prompt
start_dots_ocr_backend.bat
```

**Linux/Mac:**
```bash
python start_dots_ocr_backend.py
```

### Option 2: Manual Startup

```bash
# Start the Python backend service
cd backend
python dots_ocr_service.py
```

The service will start on `http://localhost:5001`

### Verify Service is Running

Check the health endpoint:
```bash
curl http://localhost:5001/health
```

Expected response:
```json
{
  "status": "healthy",
  "dots_ocr_available": true,
  "service": "dots-ocr-backend"
}
```

## Running the Main Application

1. **Start the DotsOCR backend service** (see above)
2. **Start the main application:**

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

3. **Open the application** at `http://localhost:5173`

## Usage

### Supported File Types
- **Images:** PNG, JPG, JPEG, GIF, BMP, TIFF
- **Documents:** PDF

### Processing Flow

1. **Upload a file** through the OCR Upload interface
2. **Real Processing:** The system attempts to use the DotsOCR backend service
3. **Fallback:** If the backend is unavailable, it falls back to realistic simulation
4. **Progress Tracking:** Real-time progress updates through multiple stages:
   - Upload (20%)
   - OCR Processing (50%)
   - Data Parsing (75%)
   - Duplicate Check (90%)
   - Complete (100%)

### Processing Stages

The system provides detailed progress tracking:
- **Upload:** File upload and validation
- **OCR:** Optical character recognition
- **Parsing:** Structured data extraction
- **Duplicate Check:** Checking for existing records
- **Complete:** Processing finished

## API Endpoints

### DotsOCR Backend Service

#### Health Check
```http
GET http://localhost:5001/health
```

#### Process Document
```http
POST http://localhost:5001/parse
Content-Type: multipart/form-data

file: [binary file data]
document_type: "invoice" (optional)
```

## Troubleshooting

### Common Issues

#### 1. "DotsOCR service is not available"
- Ensure the Python backend service is running
- Check if port 5001 is available
- Verify Python dependencies are installed

#### 2. "Failed to initialize DotsOCR Parser"
- Check if `dots.ocr` directory exists
- Verify Python path includes the project root
- Ensure all required ML dependencies are installed

#### 3. Processing takes too long
- First-time processing may be slow due to model loading
- Subsequent requests should be faster
- Consider increasing timeout in environment variables

#### 4. Memory issues
- DotsOCR requires significant RAM for ML models
- Close other applications to free memory
- Consider using smaller image files

### Debug Mode

Enable debug mode for detailed logging:
```env
DOTS_OCR_BACKEND_DEBUG=true
VITE_DEBUG_MODE=true
```

### Logs

Check logs for troubleshooting:
- **Backend Service:** Console output from the Python service
- **Frontend:** Browser developer console
- **Network:** Browser Network tab for API requests

## Performance Optimization

### Model Loading
- Models are loaded on first request (may take 30-60 seconds)
- Subsequent requests are much faster
- Keep the backend service running to avoid reloading

### File Size Optimization
- Compress large images before upload
- Use appropriate DPI settings (200 DPI recommended)
- PDF files are automatically optimized

### Memory Management
- The service automatically manages memory
- Restart the service if memory usage becomes excessive
- Monitor system resources during processing

## Development

### Architecture

```
Frontend (React/TypeScript)
    ↓ HTTP requests
DotsOCR Backend Service (Python/Flask)
    ↓ Direct integration
Dots.OCR Library (Python)
    ↓ ML processing
HuggingFace Models
```

### Key Files

- `backend/dots_ocr_service.py` - Python backend service
- `src/services/dotsOcrService.ts` - Frontend service integration
- `start_dots_ocr_backend.py` - Service startup script
- `backend/requirements.txt` - Python dependencies

### Adding New Features

1. **Backend:** Modify `dots_ocr_service.py`
2. **Frontend:** Update `dotsOcrService.ts`
3. **Configuration:** Add environment variables to `.env.example`

## Support

For issues related to:
- **DotsOCR Library:** Check the [official repository](https://github.com/rednote-hilab/dots.ocr)
- **Integration Issues:** Review this setup guide and check logs
- **Performance:** Monitor system resources and optimize file sizes

## License

This integration follows the same license as the main Numerizam application and respects the DotsOCR library license terms.