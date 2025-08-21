#!/bin/bash

# GarajiFlow CI/CD Setup Script
# This script automates the setup of Google Cloud Build and Firebase CI/CD pipeline

set -e

echo "🚀 Setting up GarajiFlow CI/CD Pipeline..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if gcloud is installed
check_gcloud() {
    if ! command -v gcloud &> /dev/null; then
        print_error "Google Cloud SDK is not installed. Please install it first:"
        echo "https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    print_success "Google Cloud SDK is installed"
}

# Check if firebase CLI is installed
check_firebase() {
    if ! command -v firebase &> /dev/null; then
        print_warning "Firebase CLI is not installed. Installing..."
        npm install -g firebase-tools
    fi
    print_success "Firebase CLI is available"
}

# Get user input
get_user_input() {
    echo
    print_status "Please provide the following information:"
    
    read -p "Enter your Google Cloud Project ID (e.g., garaji-flow-dev): " PROJECT_ID
    read -p "Enter your billing account ID: " BILLING_ACCOUNT
    read -p "Enter your GitHub repository URL: " GITHUB_REPO
    
    # Validate inputs
    if [[ -z "$PROJECT_ID" || -z "$BILLING_ACCOUNT" || -z "$GITHUB_REPO" ]]; then
        print_error "All fields are required!"
        exit 1
    fi
}

# Create Google Cloud Project
create_gcp_project() {
    print_status "Creating Google Cloud Project: $PROJECT_ID"
    
    # Check if project already exists
    if gcloud projects describe "$PROJECT_ID" &> /dev/null; then
        print_warning "Project $PROJECT_ID already exists"
    else
        gcloud projects create "$PROJECT_ID" --name="GarajiFlow $PROJECT_ID"
        print_success "Project created successfully"
    fi
    
    # Set as default project
    gcloud config set project "$PROJECT_ID"
    
    # Enable billing
    gcloud billing projects link "$PROJECT_ID" --billing-account="$BILLING_ACCOUNT"
    print_success "Billing enabled"
}

# Enable required APIs
enable_apis() {
    print_status "Enabling required APIs..."
    
    APIs=(
        "cloudbuild.googleapis.com"
        "firebase.googleapis.com"
        "cloudfunctions.googleapis.com"
        "firestore.googleapis.com"
        "storage.googleapis.com"
        "iam.googleapis.com"
    )
    
    for api in "${APIs[@]}"; do
        gcloud services enable "$api"
        print_status "Enabled $api"
    done
    
    print_success "All APIs enabled"
}

# Create service account
create_service_account() {
    print_status "Creating service account..."
    
    SA_NAME="garajiflow-build"
    SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"
    
    # Create service account if it doesn't exist
    if ! gcloud iam service-accounts describe "$SA_EMAIL" &> /dev/null; then
        gcloud iam service-accounts create "$SA_NAME" \
            --display-name="GarajiFlow Build Service Account"
    fi
    
    # Grant necessary roles
    ROLES=(
        "roles/cloudbuild.builds.builder"
        "roles/firebase.admin"
        "roles/datastore.user"
        "roles/storage.admin"
        "roles/iam.serviceAccountUser"
    )
    
    for role in "${ROLES[@]}"; do
        gcloud projects add-iam-policy-binding "$PROJECT_ID" \
            --member="serviceAccount:$SA_EMAIL" \
            --role="$role"
    done
    
    # Create service account key
    if [ ! -f "service-account-key.json" ]; then
        gcloud iam service-accounts keys create service-account-key.json \
            --iam-account="$SA_EMAIL"
        print_success "Service account key created"
    else
        print_warning "Service account key already exists"
    fi
}

# Create Firebase projects
setup_firebase() {
    print_status "Setting up Firebase projects..."
    
    # Login to Firebase
    firebase login --no-localhost
    
    # Create Firebase projects for different environments
    ENVIRONMENTS=("dev" "staging" "prod")
    
    for env in "${ENVIRONMENTS[@]}"; do
        FIREBASE_PROJECT_ID="garaji-flow-$env"
        
        print_status "Setting up Firebase project: $FIREBASE_PROJECT_ID"
        
        # Create Firebase project (this will fail if it exists, which is fine)
        firebase projects:create "$FIREBASE_PROJECT_ID" --display-name="GarajiFlow $env" || true
        
        # Add to .firebaserc
        firebase use --add "$FIREBASE_PROJECT_ID" "$env" || true
    done
    
    print_success "Firebase projects configured"
}

# Create Cloud Storage bucket for artifacts
create_storage_bucket() {
    print_status "Creating Cloud Storage bucket for build artifacts..."
    
    BUCKET_NAME="$PROJECT_ID-build-artifacts"
    
    # Create bucket if it doesn't exist
    if ! gsutil ls -b "gs://$BUCKET_NAME" &> /dev/null; then
        gsutil mb -p "$PROJECT_ID" "gs://$BUCKET_NAME"
        gsutil iam ch serviceAccount:"garajiflow-build@$PROJECT_ID.iam.gserviceaccount.com:objectViewer" "gs://$BUCKET_NAME"
        gsutil iam ch serviceAccount:"garajiflow-build@$PROJECT_ID.iam.gserviceaccount.com:objectCreator" "gs://$BUCKET_NAME"
    fi
    
    print_success "Storage bucket created"
}

# Update cloudbuild.yaml with project-specific values
update_cloudbuild_config() {
    print_status "Updating Cloud Build configuration..."
    
    # Replace placeholder values in cloudbuild.yaml
    sed -i "s/garaji-flow-dev/$PROJECT_ID/g" cloudbuild.yaml
    sed -i "s/gs:\/\/garajiflow-build-artifacts/gs:\/\/$PROJECT_ID-build-artifacts/g" cloudbuild.yaml
    
    print_success "Cloud Build configuration updated"
}

# Create environment files
setup_environment() {
    print_status "Setting up environment configuration..."
    
    # Create .env.local from example
    if [ ! -f ".env.local" ]; then
        cp env.example .env.local
        print_warning "Created .env.local from example. Please update with your Firebase configuration."
    fi
    
    print_success "Environment configuration ready"
}

# Display next steps
show_next_steps() {
    echo
    echo "=========================================="
    print_success "CI/CD Setup Complete!"
    echo "=========================================="
    echo
    echo "Next steps:"
    echo "1. Update .env.local with your Firebase configuration"
    echo "2. Add the service account key to your GitHub repository secrets:"
    echo "   - Go to your GitHub repository settings"
    echo "   - Add secret: FIREBASE_SERVICE_ACCOUNT_KEY"
    echo "   - Value: $(base64 -w 0 service-account-key.json)"
    echo
    echo "3. Connect your GitHub repository to Cloud Build:"
    echo "   - Go to https://console.cloud.google.com/cloud-build/triggers"
    echo "   - Click 'Connect Repository'"
    echo "   - Select your GitHub repository: $GITHUB_REPO"
    echo
    echo "4. Create a Cloud Build trigger:"
    echo "   - Name: garajiflow-pr-checks"
    echo "   - Event: Pull Request"
    echo "   - Base branch: ^main$"
    echo "   - Configuration file: /cloudbuild.yaml"
    echo
    echo "5. Test the pipeline:"
    echo "   - Create a test branch and PR"
    echo "   - Monitor the build in Cloud Build console"
    echo
    echo "Useful commands:"
    echo "  ./scripts/deploy.sh dev     # Deploy to development"
    echo "  ./scripts/deploy.sh staging # Deploy to staging"
    echo "  ./scripts/deploy.sh prod    # Deploy to production"
    echo
    print_warning "Keep your service-account-key.json secure and never commit it to version control!"
}

# Main execution
main() {
    check_gcloud
    check_firebase
    get_user_input
    create_gcp_project
    enable_apis
    create_service_account
    setup_firebase
    create_storage_bucket
    update_cloudbuild_config
    setup_environment
    show_next_steps
}

# Run main function
main "$@" 