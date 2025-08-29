#!/bin/bash

echo "🚀 Quick Development Setup for GarajiFlow"

# Set environment variables for development
export VITE_USE_EMULATOR=false
export NODE_ENV=development

echo "📦 Installing dependencies..."
pnpm install

echo "🔧 Building the application..."
pnpm build

echo "🌐 Starting development server..."
echo "✅ Application will be available at: http://localhost:5173"
echo ""
echo "📝 Note: Cloud Functions are not deployed (requires Blaze plan)"
echo "📝 Using mock data for development/testing"
echo ""
echo "🔑 Test Credentials:"
echo "   Admin: admin@garajiflow.com / Admin123!"
echo "   Manager: manager@garajiflow.com / Manager123!"
echo "   Technician: technician@garajiflow.com / Tech123!"
echo "   Cashier: cashier@garajiflow.com / Cashier123!"
echo ""

# Start the development server
pnpm dev 