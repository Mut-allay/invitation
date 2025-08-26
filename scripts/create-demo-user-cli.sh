#!/bin/bash

# Create Demo User using Firebase CLI

echo "🔐 Creating Demo User with Firebase CLI..."
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if user already exists
print_status "Checking if demo user already exists..."

# Try to get user info
if firebase auth:export auth-users.json --project garaji-flow-test 2>/dev/null; then
    if grep -q "admin@demoautoshop.com" auth-users.json 2>/dev/null; then
        print_success "Demo user already exists!"
        rm -f auth-users.json
        echo
        print_success "🎉 You can log in with:"
        echo "   Email: admin@demoautoshop.com"
        echo "   Password: demo123456"
        echo
        print_success "🌐 Test login at: https://garaji-flow-test.web.app"
        exit 0
    fi
    rm -f auth-users.json
fi

print_status "Demo user does not exist. Creating now..."

# Since Firebase CLI doesn't have a direct command to create users,
# we'll provide manual instructions
echo
print_status "Firebase CLI doesn't support creating users directly."
print_status "Please create the user manually in Firebase Console:"
echo
echo "1. Go to Firebase Console:"
echo "   https://console.firebase.google.com/project/garaji-flow-test/overview"
echo
echo "2. Navigate to Authentication > Users"
echo
echo "3. Click 'Add User'"
echo
echo "4. Enter these details:"
echo "   Email: admin@demoautoshop.com"
echo "   Password: demo123456"
echo
echo "5. Click 'Add User'"
echo
print_warning "Press Enter when you've created the user..."
read -p ""

# Test if user was created
print_status "Testing if user was created..."

if firebase auth:export auth-users.json --project garaji-flow-test 2>/dev/null; then
    if grep -q "admin@demoautoshop.com" auth-users.json 2>/dev/null; then
        print_success "Demo user created successfully!"
        rm -f auth-users.json
        echo
        print_success "🎉 You can now log in with:"
        echo "   Email: admin@demoautoshop.com"
        echo "   Password: demo123456"
        echo
        print_success "🌐 Test login at: https://garaji-flow-test.web.app"
    else
        print_error "User was not found. Please check that you created it correctly."
        rm -f auth-users.json
    fi
else
    print_error "Could not verify user creation. Please check manually."
fi 