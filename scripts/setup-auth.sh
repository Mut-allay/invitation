#!/bin/bash

# GarajiFlow Firebase Authentication Setup Script

echo "🔐 Setting up Firebase Authentication for GarajiFlow..."
echo "=================================================="

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
print_status "Firebase Authentication needs to be enabled manually in the Firebase Console."
echo
print_status "Please follow these steps:"
echo
echo "1. Open Firebase Console:"
echo "   https://console.firebase.google.com/project/garaji-flow-test/overview"
echo
echo "2. In the left sidebar, click 'Authentication'"
echo
echo "3. Click 'Get Started'"
echo
echo "4. In the 'Sign-in method' tab, enable these providers:"
echo "   ✅ Email/Password (recommended)"
echo "   ✅ Google (optional)"
echo "   ✅ Anonymous (optional for testing)"
echo
echo "5. For Email/Password:"
echo "   - Click 'Email/Password'"
echo "   - Toggle 'Enable' to ON"
echo "   - Click 'Save'"
echo
echo "6. For Google (optional):"
echo "   - Click 'Google'"
echo "   - Toggle 'Enable' to ON"
echo "   - Add your support email"
echo "   - Click 'Save'"
echo
print_warning "After enabling Authentication, you'll need to create a demo user."
echo
print_status "To create the demo user, run:"
echo "   npm run seed"
echo "   or"
echo "   node scripts/seed.ts"
echo
print_status "Or manually create a user in Firebase Console:"
echo "1. Go to Authentication > Users"
echo "2. Click 'Add User'"
echo "3. Enter email: admin@demoautoshop.com"
echo "4. Enter password: demo123456"
echo "5. Click 'Add User'"
echo
print_success "Once Authentication is enabled, you can log in with:"
echo "   Email: admin@demoautoshop.com"
echo "   Password: demo123456"
echo
print_status "Press Enter when you've completed the Firebase Console setup..."
read -p ""

echo
print_status "Testing Firebase Authentication setup..."

# Test if auth is now enabled
if firebase auth:export auth-test.json --project garaji-flow-test 2>/dev/null; then
    print_success "Firebase Authentication is now enabled!"
    rm -f auth-test.json
else
    print_error "Firebase Authentication is still not enabled."
    print_status "Please complete the Firebase Console setup and try again."
fi

echo
print_success "Setup complete! You can now test the login at:"
echo "   https://garaji-flow-test.web.app" 