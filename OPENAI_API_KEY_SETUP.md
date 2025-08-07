# OpenAI API Key Configuration Guide

## Overview
This guide explains how to update the OpenAI API key across all components of the Numerizam accounting application.

## Files That Need Your New API Key

### 1. Frontend Environment Variables
**File**: `/.env` (root directory)
```env
# Replace YOUR_NEW_OPENAI_API_KEY_HERE with your actual API key
VITE_OPENAI_API_KEY=YOUR_NEW_OPENAI_API_KEY_HERE
OPENAI_API_KEY=YOUR_NEW_OPENAI_API_KEY_HERE
```

### 2. Backend Environment Variables
**File**: `/backend/.env`
```env
# Replace YOUR_NEW_OPENAI_API_KEY_HERE with your actual API key
OPENAI_API_KEY=YOUR_NEW_OPENAI_API_KEY_HERE
```

## Components That Use OpenAI API Key

### Frontend Components:
1. **`src/utils/askNumerizam.ts`** - Uses `VITE_OPENAI_API_KEY`
   - Alternative AI service for financial analysis
   - Converts plain-language queries to structured JSON

### Backend Components:
1. **`backend/accounting/langgraph_agent.py`** - Uses `OPENAI_API_KEY`
   - Main LangGraph agent for transaction processing
   - Handles natural language to accounting entry conversion

2. **`backend/accounting/langgraph_query_agent.py`** - Uses `OPENAI_API_KEY`
   - Query processing agent
   - Handles complex financial queries

3. **`backend/numerizam_project/settings.py`** - Loads `OPENAI_API_KEY`
   - Django settings configuration
   - Makes API key available to all backend components

## How to Update Your API Key

1. **Replace the placeholder** `YOUR_NEW_OPENAI_API_KEY_HERE` in both `.env` files with your actual OpenAI API key
2. **Restart both servers** to pick up the new environment variables:
   - Frontend: Vite automatically restarts when .env changes
   - Backend: Django needs manual restart

## Security Notes

- ✅ Both `.env` files are in `.gitignore` - your API keys won't be committed to version control
- ✅ Previous API keys have been commented out for reference
- ✅ The `.env.example` file has been updated with the proper configuration template

## Verification

After updating your API key:
1. Check that both servers start without errors
2. Test AI functionality in the application
3. Monitor the console for any API key related errors

## Environment Variable Names

- **Frontend**: `VITE_OPENAI_API_KEY` (Vite requires VITE_ prefix)
- **Backend**: `OPENAI_API_KEY` (Standard OpenAI environment variable name)

Both variables should contain the same API key value for consistency across the application.