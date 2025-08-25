#!/bin/bash

# GarajiFlow Complete Authentication Setup Script

echo "🔐 Completing Firebase Authentication Setup for GarajiFlow..."
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo
print_status "Step 1: Enable Firebase Authentication in Firebase Console"
echo
echo "Please follow these steps:"
echo
echo "1. Open this URL in your browser:"
echo "   https://console.firebase.google.com/project/garaji-flow-test/overview"
echo
echo "2. In the left sidebar, click 'Authentication'"
echo
echo "3. Click 'Get Started'"
echo
echo "4. In the 'Sign-in method' tab:"
echo "   - Click 'Email/Password'"
echo "   - Toggle 'Enable' to ON"
echo "   - Click 'Save'"
echo
print_warning "Press Enter when you've completed Step 1..."
read -p ""

echo
print_status "Step 2: Create Demo User"
echo
echo "Now we need to create the demo user. Choose an option:"
echo
echo "Option A: Create user manually in Firebase Console"
echo "Option B: Use the seed script (requires service account key)"
echo
read -p "Choose option (A or B): " choice

case $choice in
    [Aa])
        echo
        print_status "Manual User Creation:"
        echo "1. In Firebase Console, go to Authentication > Users"
        echo "2. Click 'Add User'"
        echo "3. Enter email: admin@demoautoshop.com"
        echo "4. Enter password: demo123456"
        echo "5. Click 'Add User'"
        echo
        print_warning "Press Enter when you've created the user..."
        read -p ""
        ;;
    [Bb])
        echo
        print_status "Using seed script..."
        if [ -f "service-account-key.json" ]; then
            print_status "Service account key found. Running seed script..."
            npm run seed
        else
            print_error "Service account key not found!"
            print_status "Please create a service account key first:"
            echo "1. Go to Firebase Console > Project Settings > Service Accounts"
            echo "2. Click 'Generate New Private Key'"
            echo "3. Save as 'service-account-key.json' in the project root"
            echo "4. Run this script again"
            exit 1
        fi
        ;;
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo
print_status "Step 3: Test Authentication"
echo
print_status "Testing if Authentication is now enabled..."

# Test if auth is now enabled
if firebase auth:export auth-test.json --project garaji-flow-test 2>/dev/null; then
    print_success "Firebase Authentication is now enabled!"
    rm -f auth-test.json
else
    print_error "Firebase Authentication is still not enabled."
    print_status "Please check that you completed Step 1 correctly."
    exit 1
fi

echo
print_success "🎉 Authentication Setup Complete!"
echo
print_success "You can now log in with:"
echo "   Email: admin@demoautoshop.com"
echo "   Password: demo123456"
echo
print_success "Test the login at:"
echo "   https://garaji-flow-test.web.app"
echo
print_status "If you encounter any issues:"
echo "1. Clear your browser cache"
echo "2. Try incognito/private browsing mode"
echo "3. Check the browser console for errors" 