# Deployment Environments

This document outlines the deployment environments and branch structure for the GaragiFlow application.

## Branch Structure

### Main Branches

- **`main`** - Production-ready code with comprehensive testing
- **`dev`** - Development environment for active development
- **`staging`** - Pre-production environment for testing
- **`prod`** - Production environment (mirrors main)

### Feature Branches

- `feature/comprehensive-testing` - Testing infrastructure
- `feature/customer-management` - Customer management features
- `feature/file-upload-polish` - File upload improvements
- `feature/inventory-management` - Inventory management features
- `feature/invoice-payment` - Invoice and payment features
- `feature/repair-service` - Repair service features
- `feature/sales-management` - Sales management features

## Environment Flow

```
Feature Branches → dev → staging → main/prod
```

### Development Workflow

1. **Feature Development**: Work on feature branches
2. **Development Testing**: Merge to `dev` for integration testing
3. **Staging Testing**: Merge to `staging` for pre-production testing
4. **Production Deployment**: Merge to `main` and `prod` for production

## Current Status

### Latest Commit: `6bc3769`
- **Feature**: Implement proper RTK Query testing strategy for vehiclesApi
- **Status**: All environments updated with comprehensive test fixes
- **Test Results**: 28/28 tests passing ✅

### Test Coverage
- **vehiclesApi tests**: 7/7 passing ✅
- **VehicleCard tests**: 15/15 passing ✅
- **useVehicles tests**: 6/6 passing ✅
- **Total**: 28/28 tests passing ✅

## Deployment Commands

### Local Branch Management
```bash
# Switch to development
git checkout dev

# Switch to staging
git checkout staging

# Switch to production
git checkout prod

# Switch to main
git checkout main
```

### Remote Deployment
```bash
# Push to development
git push origin dev

# Push to staging
git push origin staging

# Push to production
git push origin prod

# Push to main
git push origin main
```

### Environment Updates
```bash
# Update staging from main
git checkout staging
git merge main
git push origin staging

# Update prod from main
git checkout prod
git merge main
git push origin prod
```

## Quality Gates

All environments include:
- ✅ Comprehensive test suite (28/28 tests passing)
- ✅ RTK Query testing strategy implemented
- ✅ Jest configuration optimized
- ✅ TypeScript compilation
- ✅ ESLint quality checks
- ✅ Pre-commit hooks

## Repository URLs

- **Remote**: https://github.com/hytel-io/garagiflow.git
- **Dev Branch**: https://github.com/hytel-io/garagiflow/tree/dev
- **Staging Branch**: https://github.com/hytel-io/garagiflow/tree/staging
- **Main Branch**: https://github.com/hytel-io/garagiflow/tree/main
- **Prod Branch**: https://github.com/hytel-io/garagiflow/tree/prod

## Last Updated

- **Date**: January 2024
- **Commit**: 6bc3769
- **Status**: All environments synchronized and ready for deployment 