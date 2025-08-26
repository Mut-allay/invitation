#!/bin/bash

# GarajiFlow Demo User Setup Script

echo "🔐 GarajiFlow Demo User Setup"
echo "============================="

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

# Step 1: Check if user already exists
print_status "Step 1: Checking if demo user exists..."

if firebase auth:export auth-check.json --project garaji-flow-test 2>/dev/null; then
    if grep -q "admin@demoautoshop.com" auth-check.json 2>/dev/null; then
        print_success "Demo user already exists!"
        rm -f auth-check.json
        echo
        print_success "🎉 You can log in with:"
        echo "   Email: admin@demoautoshop.com"
        echo "   Password: demo123456"
        echo
        print_success "🌐 Test login at: https://garaji-flow-test.web.app"
        exit 0
    fi
    rm -f auth-check.json
fi

print_status "Demo user does not exist. Let's create it!"

# Step 2: Guide user through manual creation
echo
print_status "Step 2: Create Demo User in Firebase Console"
echo
echo "Please follow these exact steps:"
echo
echo "1. Open Firebase Console:"
echo "   https://console.firebase.google.com/project/garaji-flow-test/overview"
echo
echo "2. In the left sidebar, click 'Authentication'"
echo
echo "3. Click on the 'Users' tab"
echo
echo "4. Click the 'Add User' button"
echo
echo "5. In the popup form, enter:"
echo "   • Email: admin@demoautoshop.com"
echo "   • Password: demo123456"
echo "   • (Leave other fields empty)"
echo
echo "6. Click 'Add User'"
echo
print_warning "Press Enter when you've completed these steps..."
read -p ""

# Step 3: Verify user creation
echo
print_status "Step 3: Verifying user creation..."

if firebase auth:export auth-verify.json --project garaji-flow-test 2>/dev/null; then
    if grep -q "admin@demoautoshop.com" auth-verify.json 2>/dev/null; then
        print_success "Demo user created successfully!"
        rm -f auth-verify.json
        echo
        print_success "🎉 Setup Complete!"
        echo
        print_success "Login Credentials:"
        echo "   Email: admin@demoautoshop.com"
        echo "   Password: demo123456"
        echo
        print_success "Test the application:"
        echo "   https://garaji-flow-test.web.app"
        echo
        print_status "Next steps:"
        echo "1. Go to the application URL"
        echo "2. Click 'Sign in' or navigate to login"
        echo "3. Enter the credentials above"
        echo "4. Click 'Sign in'"
        echo
        print_success "✅ Authentication setup is now complete!"
        
    else
        print_error "User was not found in the export."
        print_status "Please check that you:"
        echo "1. Created the user with exactly: admin@demoautoshop.com"
        echo "2. Used the correct password: demo123456"
        echo "3. Clicked 'Add User' to save"
        rm -f auth-verify.json
        exit 1
    fi
else
    print_error "Could not verify user creation."
    print_status "Please check that Firebase Authentication is properly enabled."
    exit 1
fi 