#!/bin/bash

# Function to check if a port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
    return $?
}

# Kill any running emulators
echo "🧹 Cleaning up existing emulator processes..."
for port in 5001 8080 9099 9199; do
    if check_port $port; then
        echo "Killing process on port $port"
        npx kill-port $port
    fi
done

# Set environment variables for emulators
export FIRESTORE_EMULATOR_HOST="localhost:8080"
export FIREBASE_AUTH_EMULATOR_HOST="localhost:9099"
export FIREBASE_STORAGE_EMULATOR_HOST="localhost:9199"
export FUNCTIONS_EMULATOR="true"

# Install and build functions
echo "🔨 Installing and building functions..."
cd functions
npm install
npm run build
cd ..

# Start Firebase emulators
echo "🚀 Starting Firebase emulators..."
firebase emulators:start --only auth,functions,firestore,storage &

# Function to check if emulators are ready
check_emulators() {
    curl -s http://localhost:8080 > /dev/null && \
    curl -s http://localhost:9099 > /dev/null && \
    curl -s http://localhost:5001 > /dev/null && \
    curl -s http://localhost:9199 > /dev/null
    return $?
}

# Wait for emulators to start
echo "⏳ Waiting for emulators to start..."
max_attempts=30
attempt=1

while ! check_emulators && [ $attempt -le $max_attempts ]; do
    echo "Attempt $attempt of $max_attempts..."
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ Emulators failed to start within the timeout period"
    exit 1
fi

echo "✅ Emulators are ready!"

# Install and run test interface
echo "🧪 Setting up and starting test interface..."
cd scripts
npm install
npm run test
