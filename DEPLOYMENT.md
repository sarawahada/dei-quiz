# DEI Quiz - Render.com Deployment Guide

## Project Overview
This is a real-time DEI (Diversity, Equity, and Inclusion) quiz application built with:
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express.js + Socket.IO
- **Real-time Communication**: WebSocket connections for live quiz sessions

## Deployment Readiness ✅
The project is ready for Render.com deployment with the following features:
- ✅ Proper Node.js version specification (20.x)
- ✅ Production build process
- ✅ Static file serving configuration
- ✅ Environment variable support
- ✅ Health check endpoint

## Deployment Options

### Option 1: One-Click Deploy (Recommended)
1. Click the "Deploy to Render" button below:
   [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/YOUR_USERNAME/dei-quiz)

2. Connect your GitHub repository
3. Render will automatically detect the configuration from `render.yaml`

### Option 2: Manual Deployment
1. **Create a new Web Service on Render.com**
2. **Connect your GitHub repository**
3. **Configure the service:**
   - **Name**: `dei-quiz`
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: `20.x` (auto-detected from package.json)

4. **Environment Variables** (Optional):
   - `NODE_ENV`: `production`

5. **Deploy**: Click "Create Web Service"

## Build Process
The deployment process will:
1. Install root dependencies (`npm install`)
2. Install frontend dependencies (`cd dei-quiz-frontend && npm install`)
3. Build the React frontend (`npm run build`)
4. Install backend dependencies (`cd dei-quiz-backend && npm install`)
5. Start the Express server (`npm start`)

## Application Features
- **Host Mode**: Create quiz rooms with QR codes
- **Player Mode**: Join rooms and answer questions
- **Real-time Updates**: Live player list and question progression
- **Character Analysis**: DEI personality assessment based on answers
- **Responsive Design**: Works on desktop and mobile devices

## Technical Details
- **Port**: Automatically assigned by Render (uses `process.env.PORT`)
- **Static Files**: Served from `dei-quiz-frontend/dist/`
- **API Routes**: All non-static routes serve the React app (SPA routing)
- **WebSocket**: Socket.IO for real-time communication
- **CORS**: Configured for all origins (`*`)

## Local Development
```bash
# Install all dependencies
npm run install-all

# Start development (requires two terminals)
# Terminal 1: Backend
cd dei-quiz-backend && npm start

# Terminal 2: Frontend
cd dei-quiz-frontend && npm run dev
```

## Troubleshooting
- **Build Failures**: Check Node.js version (requires 18-21.x, specified in .nvmrc)
- **PathError with Express**: Fixed by using `app.use()` middleware instead of wildcard routes
- **Socket.IO Issues**: Ensure WebSocket connections are allowed
- **Static File Issues**: Verify frontend build completed successfully
- **Port Issues**: Render automatically assigns ports via `process.env.PORT`

## Post-Deployment
After successful deployment:
1. Test the application by visiting your Render URL
2. Create a quiz room as a host
3. Join the room from another device/browser
4. Verify real-time functionality works correctly

## Cost
- **Free Tier**: 750 hours/month (sufficient for development/testing)
- **Paid Plans**: Start at $7/month for always-on services

