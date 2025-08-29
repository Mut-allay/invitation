#!/bin/bash

echo "🚀 Starting Firebase Emulators for local development..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first."
    exit 1
fi

# Set environment variable to use emulators
export VITE_USE_EMULATOR=true

# Start Firebase emulators
echo "📡 Starting emulators..."
firebase emulators:start --project garaji-flow-dev --only auth,firestore,functions,storage

echo "✅ Emulators started successfully!"
echo "🌐 Auth Emulator: http://localhost:9099"
echo "🔥 Firestore Emulator: http://localhost:8080"
echo "⚡ Functions Emulator: http://localhost:5001"
echo "📦 Storage Emulator: http://localhost:9199"
echo "🎯 Emulator UI: http://localhost:4000" 