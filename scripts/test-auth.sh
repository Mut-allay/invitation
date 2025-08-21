#!/bin/bash

# Test Firebase Authentication Setup

echo "🧪 Testing Firebase Authentication Setup..."
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

echo
print_status "Testing if Firebase Authentication is enabled..."

# Test if auth is now enabled
if firebase auth:export auth-test.json --project garaji-flow-test 2>/dev/null; then
    print_success "Firebase Authentication is enabled!"
    rm -f auth-test.json
    
    echo
    print_success "🎉 Authentication Setup is Complete!"
    echo
    print_success "You can now log in with:"
    echo "   Email: admin@demoautoshop.com"
    echo "   Password: demo123456"
    echo
    print_success "Test the login at:"
    echo "   https://garaji-flow-test.web.app"
    echo
    print_status "If login still doesn't work:"
    echo "1. Clear your browser cache"
    echo "2. Try incognito/private browsing mode"
    echo "3. Check that the user was created correctly"
    
else
    print_error "Firebase Authentication is still not enabled."
    echo
    print_status "Please complete these steps:"
    echo "1. Go to Firebase Console: https://console.firebase.google.com/project/garaji-flow-test/overview"
    echo "2. Click 'Authentication' in the left sidebar"
    echo "3. Click 'Get Started'"
    echo "4. Enable 'Email/Password' authentication"
    echo "5. Create user: admin@demoautoshop.com / demo123456"
    echo "6. Run this test script again"
fi 