#!/bin/bash

# Kill any running emulators
echo "🔄 Cleaning up existing emulator processes..."
lsof -t -i:8080 -i:9099 -i:9199 -i:5001 | xargs kill -9 2>/dev/null

# Set environment variables
export FIRESTORE_EMULATOR_HOST="localhost:8080"
export FIREBASE_AUTH_EMULATOR_HOST="localhost:9099"
export FIREBASE_STORAGE_EMULATOR_HOST="localhost:9199"
export FUNCTIONS_EMULATOR="true"

# Install dependencies and build functions
echo "📦 Installing dependencies and building functions..."
cd functions
npm install
npm run build
cd ..

# Start Firebase emulators
echo "🚀 Starting Firebase emulators..."
firebase emulators:start --only auth,functions,firestore,storage &

# Wait for emulators to be ready
echo "⏳ Waiting for emulators to be ready..."
until curl -s http://localhost:8080 >/dev/null; do
    sleep 1
done

# Set up test interface
echo "🔧 Setting up test interface..."
cd scripts
npm install
npm run test
