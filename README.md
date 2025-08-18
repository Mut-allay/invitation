# Garaji Flow

A cloud-based, multi-tenant ERP system for Zambian car & motorcycle showrooms & repair shops.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm
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

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your Firebase project configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=garaji-flow-dev.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=garaji-flow-dev
   VITE_FIREBASE_STORAGE_BUCKET=garaji-flow-dev.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

## 🏗️ Project Structure

```
garajiflow/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React contexts (Auth, etc.)
│   ├── pages/              # Page components
│   ├── store/              # Redux store and RTK Query
│   ├── config/             # Configuration files
│   └── types/              # TypeScript type definitions
├── functions/              # Firebase Cloud Functions
├── docs/                   # Documentation
└── public/                 # Static assets
```

## 🔧 Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests
- `pnpm deploy:dev` - Deploy to development environment
- `pnpm deploy:staging` - Deploy to staging environment
- `pnpm deploy:prod` - Deploy to production environment

### Firebase Projects

The project uses three Firebase environments:

- **Development**: `garaji-flow-dev`
- **Staging**: `garaji-flow-staging`
- **Production**: `garaji-flow-prod`

Switch between environments:
```bash
firebase use garaji-flow-dev    # Development
firebase use garaji-flow-staging # Staging
firebase use garaji-flow-prod    # Production
```

## 🚀 Deployment

### CI/CD Pipeline

The project uses GitHub Actions for automated deployment:

- **Staging**: Automatically deploys on push to `staging` branch
- **Production**: Automatically deploys on push to `main` branch

### Manual Deployment

```bash
# Deploy to development
pnpm deploy:dev

# Deploy to staging
pnpm deploy:staging

# Deploy to production
pnpm deploy:prod
```

## 🔐 Authentication & Security

### User Roles

- **Admin**: Full access within tenant
- **Manager**: Full access except tenant deletion
- **Cashier**: Sales, customer, and payment modules
- **Mechanic**: Read-only vehicles, write job cards
- **Accountant**: Read-only access, financial reports

### Security Rules

- Multi-tenant data isolation
- Role-based access control
- Firebase Security Rules enforcement
- Custom claims for user permissions

## 📊 Features

### Core Modules

- **Sales Management**: Vehicle catalog, quotations, sales tracking
- **Repair & Service**: Job cards, mechanic scheduling, parts allocation
- **Inventory Management**: Parts tracking, stock management, reorder alerts
- **Customer Management**: CRM, service history, marketing consent
- **Financial Management**: Invoices, payments, ZRA compliance
- **User Management**: Multi-tenant user administration

### Regulatory Compliance

- **ZRA Smart-Invoice**: Real-time invoice submission
- **NAPSA**: Automated contribution reports
- **WCFCB**: Annual earnings returns
- **Data Protection**: GDPR-compliant data handling

## 🛠️ Technology Stack

### Frontend
- React 19 + TypeScript
- Vite (Build tool)
- Redux Toolkit + RTK Query
- React Router v6
- TailwindCSS
- Headless UI

### Backend
- Firebase Firestore (Database)
- Firebase Authentication
- Firebase Cloud Functions
- Firebase Storage
- Firebase Hosting

### DevOps
- GitHub Actions (CI/CD)
- Firebase CLI
- TypeScript
- ESLint + Prettier

## 📝 Contributing

1. Create a feature branch from `staging`
2. Make your changes
3. Run tests and linting
4. Submit a pull request
5. Code review and merge to `staging`
6. Deploy to production after testing

## 📄 License

This project is proprietary software for Hytel Technologies.

## 🆘 Support

For technical support or questions, contact the development team.

---

**Garaji Flow** - Empowering Zambian automotive businesses with modern ERP solutions.
