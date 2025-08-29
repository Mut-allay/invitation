#!/bin/bash

echo "🚀 Starting Firebase Emulators for garaji-flow-test..."

# Start Firebase emulators
firebase emulators:start \
  --only auth,firestore,functions,storage \
  --project garaji-flow-test \
  --import=./emulator-data \
  --export-on-exit=./emulator-data

echo "✅ Emulators started successfully!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Emulator UI: http://localhost:4000" 