#!/bin/bash

# GarajiFlow Deployment Script
# Usage: ./scripts/deploy.sh [dev|staging|prod]

set -e

ENVIRONMENT=${1:-dev}

echo "🚀 Deploying GarajiFlow to $ENVIRONMENT environment..."

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo "❌ Invalid environment. Use: dev, staging, or prod"
    exit 1
fi

# Set Firebase project
case $ENVIRONMENT in
    "dev")
        PROJECT_ID="garaji-flow-dev"
        ;;
    "staging")
        PROJECT_ID="garaji-flow-staging"
        ;;
    "prod")
        PROJECT_ID="garaji-flow-prod"
        ;;
esac

echo "📦 Building application..."
npm run build

echo "🧪 Running tests..."
npm run test:ci

echo "🔧 Deploying to Firebase project: $PROJECT_ID"
firebase use $PROJECT_ID
firebase deploy --only hosting,functions,firestore:rules,storage

echo "✅ Deployment to $ENVIRONMENT completed successfully!"
echo "🌐 Your app is live at: https://$PROJECT_ID.web.app" 