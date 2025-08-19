# 🚗 Garaji Flow - Automotive ERP System

A comprehensive, multi-tenant automotive business management system built for the Zambian market. Designed to streamline vehicle sales, repairs, customer management, and financial operations with ZRA compliance.

## 🎯 Project Overview

**Primary Objective**: Deliver a rock-solid, visually polished, and compelling MVP by EOD Monday, 25th August 2025, for demonstration at the Zambia Motor Show.

**Guiding Principle**: Demo over Depth. Prioritize features that create a powerful demonstration. Simplify non-visual complexity.

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript and Hooks
- **Vite** for fast development and optimized builds
- **Redux Toolkit** with RTK Query for state management
- **React Router v6** for client-side routing
- **TailwindCSS** for utility-first styling
- **Headless UI** for accessible components
- **Heroicons** for consistent iconography

### Backend Stack
- **Firebase Cloud Functions** (2nd Gen, Node.js 20)
- **Cloud Firestore** (Native Mode) for database
- **Firebase Authentication** for user management
- **Firebase Storage** for file uploads
- **Firebase Hosting** for deployment

### DevOps
- **GitHub Actions** for CI/CD pipelines
- **Multi-environment deployment** (dev, staging, prod)
- **Automated testing** and quality gates

## 🚀 Features Implemented

### ✅ Core Modules

#### 1. **Sales Management**
- Vehicle catalog with search and filtering
- Sales workflow with customer integration
- Vehicle status tracking (available, sold, reserved, in repair)
- Sales statistics and reporting
- Vehicle image management

#### 2. **Repair & Service**
- Multi-step repair workflow
- Job card management with mechanic assignment
- Parts usage tracking with inventory integration
- Repair status monitoring
- Labor cost calculation

#### 3. **Customer Management**
- Complete CRM with customer profiles
- Vehicle ownership tracking
- Customer search and filtering
- Customer statistics and insights

#### 4. **Inventory Management**
- Parts, tools, and consumables tracking
- Low stock alerts and reorder levels
- Supplier management
- Stock value calculations
- Category-based organization

#### 5. **Invoice & Payment**
- ZRA-compliant invoice generation
- VAT calculation (16% Zambian rate)
- Payment processing with multiple methods
- Invoice status tracking
- ZRA Smart-Invoice integration (placeholder)

#### 6. **File Upload System**
- Drag-and-drop file uploads
- Image and document management
- Firebase Storage integration
- File metadata tracking
- Secure file access with signed URLs

### ✅ Dashboard Analytics
- Real-time business metrics
- Sales performance tracking
- Repair completion rates
- Customer insights
- Financial summaries
- Recent activity feeds

### ✅ Security & Compliance
- Multi-tenant architecture with tenant isolation
- Role-based access control (RBAC)
- Firebase security rules
- ZRA compliance features
- Audit logging

## 📊 Business Metrics

The system tracks comprehensive business metrics including:
- Total sales and revenue
- Vehicle inventory status
- Repair completion rates
- Customer acquisition and retention
- Inventory turnover
- Payment collection rates

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and pnpm
- Firebase CLI
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd garajiflow
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment setup**
   ```bash
   cp env.example .env.local
   # Configure Firebase project settings
   ```

4. **Firebase setup**
   ```bash
   firebase login
   firebase use garaji-flow-dev
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

### Environment Configuration

Create `.env.local` with:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 🚀 Deployment

### Development
```bash
pnpm deploy:dev
```

### Staging
```bash
pnpm deploy:staging
```

### Production
```bash
pnpm deploy:prod
```

## 📁 Project Structure

```
garajiflow/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Shared components
│   │   ├── vehicles/       # Vehicle-related components
│   │   ├── sales/          # Sales components
│   │   ├── repairs/        # Repair components
│   │   ├── customers/      # Customer components
│   │   ├── inventory/      # Inventory components
│   │   └── invoices/       # Invoice components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── store/              # Redux store and API slices
│   ├── types/              # TypeScript type definitions
│   ├── contexts/           # React contexts
│   └── config/             # Configuration files
├── functions/              # Firebase Cloud Functions
│   └── src/
│       ├── auth.ts         # Authentication functions
│       ├── vehicles.ts     # Vehicle management
│       ├── sales.ts        # Sales operations
│       ├── repairs.ts      # Repair management
│       ├── customers.ts    # Customer operations
│       ├── inventory.ts    # Inventory management
│       ├── invoices.ts     # Invoice and payment
│       └── upload.ts       # File upload handling
├── scripts/                # Utility scripts
└── docs/                   # Documentation
```

## 🔧 API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Vehicles
- `GET /vehicles` - List vehicles
- `POST /vehicles` - Create vehicle
- `PUT /vehicles/:id` - Update vehicle
- `DELETE /vehicles/:id` - Delete vehicle

### Sales
- `GET /sales` - List sales
- `POST /sales` - Create sale
- `PUT /sales/:id` - Update sale
- `DELETE /sales/:id` - Delete sale

### Repairs
- `GET /repairs` - List repairs
- `POST /repairs` - Create repair
- `PUT /repairs/:id` - Update repair
- `POST /repairs/:id/job-cards` - Add job card

### Customers
- `GET /customers` - List customers
- `POST /customers` - Create customer
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer

### Inventory
- `GET /inventory` - List inventory items
- `POST /inventory` - Create inventory item
- `PUT /inventory/:id` - Update inventory item
- `DELETE /inventory/:id` - Delete inventory item

### Invoices
- `GET /invoices` - List invoices
- `POST /invoices` - Create invoice
- `PUT /invoices/:id` - Update invoice
- `POST /invoices/:id/submit-zra` - Submit to ZRA
- `POST /payments` - Process payment

### File Upload
- `POST /upload` - Upload file
- `GET /files` - List uploaded files
- `DELETE /files/:id` - Delete file
- `GET /files/:id/signed-url` - Get signed URL

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## 📈 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **Bundle Size**: < 500KB gzipped
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s

## 🔒 Security Features

- **Multi-tenant isolation** with tenant-scoped data access
- **Role-based access control** with custom claims
- **Firebase security rules** for data protection
- **Input validation** and sanitization
- **CSRF protection** and secure headers
- **Rate limiting** on API endpoints

## 🌍 ZRA Compliance

- **VAT calculation** (16% Zambian rate)
- **Invoice numbering** with ZRA format
- **Tax breakdown** and reporting
- **ZRA Smart-Invoice integration** (placeholder)
- **QR code generation** for invoices
- **Mark ID tracking** for ZRA submission

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes and commit: `git commit -m 'feat: Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Create a Pull Request

## 📞 Support

For support and questions:
- **Email**: support@garajiflow.com
- **Phone**: +260 XXX XXX XXX
- **Documentation**: [docs.garajiflow.com](https://docs.garajiflow.com)

## 📄 License

This project is proprietary software. All rights reserved.

---

**Built with ❤️ for the Zambian automotive industry**
