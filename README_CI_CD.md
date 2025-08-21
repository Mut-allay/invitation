# GarajiFlow CI/CD Pipeline

This document provides a complete guide to the Continuous Integration and Continuous Deployment (CI/CD) pipeline for GarajiFlow, built with Google Cloud Platform and Firebase.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Run the automated setup script
./scripts/setup-ci-cd.sh
```

### Option 2: Manual Setup
Follow the detailed guide in [docs/CI_CD_SETUP.md](docs/CI_CD_SETUP.md)

## 📋 Overview

The CI/CD pipeline provides:

- **Automated Testing**: Linting, type checking, unit tests, and API tests
- **Security Scanning**: Vulnerability scanning with Trivy
- **Multi-Environment Deployment**: Dev, staging, and production environments
- **Pull Request Reviews**: Automated checks for every PR
- **Cost Optimization**: Free tier usage and efficient builds

## 🏗️ Architecture

```
GitHub Repository
       ↓
Cloud Build Trigger
       ↓
Automated Pipeline:
├── Install Dependencies
├── Run Linting
├── Type Checking
├── Unit Tests
├── API Tests
├── Build Application
├── Security Scan
└── Deploy to Firebase
```

## 🔧 Configuration Files

### Core Configuration
- `cloudbuild.yaml` - Main Cloud Build pipeline configuration
- `firebase.json` - Firebase hosting and functions configuration
- `.firebaserc` - Firebase project aliases
- `firestore.rules` - Database security rules
- `storage.rules` - Storage security rules
- `firestore.indexes.json` - Database indexes for performance

### Environment Configuration
- `env.example` - Environment variables template
- `.env.local` - Local environment variables (create from example)

### Scripts
- `scripts/setup-ci-cd.sh` - Automated setup script
- `scripts/deploy.sh` - Manual deployment script

## 🌍 Environments

| Environment | Trigger | URL | Purpose |
|-------------|---------|-----|---------|
| **Development** | All PRs | `https://garaji-flow-dev.web.app` | Feature testing |
| **Staging** | Merges to develop | `https://garaji-flow-staging.web.app` | Integration testing |
| **Production** | Merges to main | `https://garaji-flow-prod.web.app` | Live application |

## 🔄 Workflow

### For Junior Developers
1. Create a feature branch: `git checkout -b feature/new-feature`
2. Make changes and commit: `git commit -m "Add new feature"`
3. Push and create PR: `git push origin feature/new-feature`
4. **Automated checks run automatically**
5. Fix any issues if checks fail
6. Senior developer reviews and merges

### For Senior Developers
1. Review PR with confidence - all automated checks are visible
2. Green checks = code is well-formatted, tested, and builds successfully
3. Red checks = specific issues to address before review
4. Focus review on logic, architecture, and implementation quality

## 🛠️ Build Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Linting
```bash
npm run lint
```
Checks code style and formatting using ESLint.

### 3. Type Checking
```bash
npm run type-check
```
Validates TypeScript types without emitting files.

### 4. Unit Tests
```bash
npm run test:ci
```
Runs Jest tests with coverage reporting.

### 5. API Tests
```bash
npm run test:api
```
Tests Cloud Functions and API endpoints.

### 6. Build Application
```bash
npm run build
```
Creates production build using Vite.

### 7. Security Scan
```bash
trivy fs --severity HIGH,CRITICAL .
```
Scans for vulnerabilities in dependencies and code.

### 8. Deploy to Firebase
```bash
firebase deploy --only hosting,functions
```
Deploys to the appropriate environment.

## 📊 Monitoring

### Cloud Build Console
- View build logs: [Cloud Build Console](https://console.cloud.google.com/cloud-build/builds)
- Monitor build times and success rates
- Set up notifications for failures

### Firebase Console
- Monitor function performance: [Firebase Console](https://console.firebase.google.com)
- View hosting analytics and errors
- Check Firestore usage and performance

### GitHub PR Checks
- Real-time status updates in PR interface
- Detailed logs for each build step
- Quick access to failure details

## 💰 Cost Management

### Free Tier Limits
- **Cloud Build**: 120 build-minutes/day
- **Firebase Hosting**: 10GB storage, 360MB/day transfer
- **Firestore**: 1GB storage, 50K reads/day, 20K writes/day
- **Cloud Functions**: 2M invocations/month

### Cost Optimization
- Use build caching to reduce build times
- Optimize test execution with parallel runs
- Monitor usage and set up billing alerts
- Use appropriate machine types for builds

## 🔒 Security

### Service Account Security
- Use least privilege principle
- Rotate service account keys regularly
- Store keys securely in GitHub Secrets
- Never commit keys to version control

### Firebase Security Rules
- Comprehensive rules for Firestore and Storage
- User-based access control
- Admin role for system-wide operations
- Regular security audits

### Dependency Security
- Automated vulnerability scanning
- Regular dependency updates
- Security-focused linting rules
- Container image scanning

## 🚨 Troubleshooting

### Common Issues

#### Build Fails on Dependencies
```bash
# Check package.json
npm list

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Firebase Deployment Fails
```bash
# Check Firebase project
firebase projects:list
firebase use garaji-flow-dev

# Verify service account permissions
gcloud projects get-iam-policy garaji-flow-dev
```

#### Tests Fail
```bash
# Run tests locally
npm run test:ci

# Check test environment
npm run test:unit
npm run test:api
```

#### Security Scan Fails
```bash
# Update vulnerable dependencies
npm audit fix

# Check specific vulnerabilities
npm audit
```

### Useful Commands

```bash
# Manual deployment
./scripts/deploy.sh dev

# Check build status
gcloud builds list --limit=10

# View build logs
gcloud builds log BUILD_ID

# Test locally
npm run dev
npm run test:ci
npm run build
```

## 📚 Resources

### Documentation
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

### Tools
- [Google Cloud Console](https://console.cloud.google.com)
- [Firebase Console](https://console.firebase.google.com)
- [Cloud Build Console](https://console.cloud.google.com/cloud-build)

### Support
- [Google Cloud Support](https://cloud.google.com/support)
- [Firebase Support](https://firebase.google.com/support)
- [GitHub Actions vs Cloud Build](https://cloud.google.com/build/docs/automating-builds/github/build-repos-from-github)

## 🤝 Contributing

### Adding New Build Steps
1. Update `cloudbuild.yaml` with new step
2. Add corresponding npm script to `package.json`
3. Update documentation
4. Test locally before committing

### Modifying Deployment
1. Update `firebase.json` for configuration changes
2. Modify `scripts/deploy.sh` for deployment logic
3. Update environment-specific settings
4. Test in development environment first

### Security Updates
1. Review and update security rules
2. Update dependencies with security patches
3. Run security scans locally
4. Update documentation with new security measures

## 📈 Performance Optimization

### Build Optimization
- Use build caching for dependencies
- Parallel test execution
- Optimized Docker images
- Efficient build steps ordering

### Deployment Optimization
- Incremental deployments
- Asset optimization and compression
- CDN configuration
- Cache headers optimization

### Monitoring Optimization
- Set up performance alerts
- Monitor build times and trends
- Track deployment success rates
- Optimize based on usage patterns 