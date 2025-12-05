#!/bin/bash

# Exit on error
set -e

# Load environment variables from .env.local if it exists
if [ -f .env.local ]; then
  echo "Loading keys from .env.local..."
  export $(grep -v '^#' .env.local | xargs)
fi

# Check if GEMINI_API_KEY is set
if [ -z "$GEMINI_API_KEY" ]; then
  echo "Warning: GEMINI_API_KEY is not set. Deployment will proceed without it."
  BUILD_ARGS=""
else
  BUILD_ARGS="--build-arg GEMINI_API_KEY=$GEMINI_API_KEY"
fi

PROJECT_ID=$(gcloud config get-value project)
APP_NAME="workshop-platform"
REGION="us-central1"

echo "Starting deployment for $APP_NAME to project $PROJECT_ID in region $REGION..."

# Submit build to Cloud Build
# We pass the API key as a build argument
echo "Submitting build to Cloud Build..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$APP_NAME \
  $BUILD_ARGS .

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $APP_NAME \
  --image gcr.io/$PROJECT_ID/$APP_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated

echo "Deployment successfully completed!"
