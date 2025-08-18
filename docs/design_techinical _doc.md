Technical Design Document
Cloud-Based, Multi-Tenant ERP for Zambian Car & Motorcycle Showrooms & Repair Shops
Frontend: React + Vite | Backend: Firebase (Firestore, Auth, Cloud Functions, Storage)
Version 1.0 – 18 August 2025
────────────────────────────────────────────────────────
1. Introduction and System Overview
1.1 Purpose
This document delivers a complete technical blueprint for building, deploying, and operating a cloud-native Enterprise Resource Planning (ERP) system. It is designed to empower Zambian automotive businesses—from formal dealerships to informal roadside workshops—to digitize and optimize their core operations. The system is delivered under a multi-tenant Software-as-a-Service (SaaS) subscription model.
1.2 Scope
The system's boundaries encompass the full operational lifecycle of a vehicle sales and service business:
    • Vehicle Sales: Management of new and used cars and motorcycles, including trade-ins, quotations, and sales finalization.
    • Repair & Service: End-to-end management of the repair process, from customer check-in and job card creation to mechanic bay scheduling, parts allocation, and final invoicing.
    • Inventory Management: Granular tracking of spare parts, consumables (oils, fluids), and workshop tools.
    • Customer Relationship Management (CRM): A unified view of customer history, vehicle ownership, service reminders, and marketing consent management.
    • Financial Tracking: Comprehensive financial tools including quotations, ZRA-compliant tax invoices, payment receipts, supplier bill management, and automated calculations for statutory remittances (NAPSA, WCFCB).
    • Multi-Tenancy: Each subscribing business (tenant) operates within a secure, logically isolated data silo, ensuring complete data privacy and integrity.
Out-of-Scope for Version 1.0:
    • Advanced fleet management for large-scale logistics companies.
    • Direct integration with vehicle manufacturer warranty systems.
    • Specialized modules for non-standard verticals like tyre retreading or heavy machinery.
1.3 Target Audience
    • Technical: Software Architects, Senior Frontend/Backend Developers, Firebase DevOps/Cloud Engineers, QA Engineers.
    • Management: Product Managers, Engineering Managers, Project Managers.
    • Stakeholders: Key business stakeholders, investors, and representatives from Zambian regulatory bodies (ZRA, NAPSA).
1.4 Technology Stack
    • Frontend: React 18 (with Hooks), TypeScript, Vite (as the build tool), React Router v6, Redux Toolkit (with RTK Query), TailwindCSS (for utility-first styling), Headless UI (for accessible components).
    • Backend (Firebase Ecosystem):
        ◦ Database: Cloud Firestore (in Native Mode).
        ◦ Authentication: Firebase Authentication (supporting Email/Password, Google, and Phone providers).
        ◦ Serverless Logic: Cloud Functions for Firebase (2nd Gen, Node.js 20 runtime).
        ◦ File Storage: Cloud Storage for Firebase.
        ◦ Hosting: Firebase Hosting with Global CDN.
        ◦ Automation: Firebase Extensions (e.g., Resize Images) and Cloud Scheduler for cron jobs.
    • DevOps: GitHub for version control, GitHub Actions for CI/CD pipelines deploying via the Firebase CLI.
    • Future Analytics: Phased integration with BigQuery (via Firebase Extensions) and Looker Studio for aggregated, anonymized cross-tenant analytics.
2. System Architecture
2.1 High-Level Architecture Diagram
code Code
downloadcontent_copyexpand_less
    ┌────────────────────────────────────────────┐
│               Tenant Browser                │
│            React SPA (Vite/PWA)            │
└────────────────────┬───────────────────────┘
                     │ HTTPS / REST / WebSockets
┌────────────────────┴───────────────────────┐
│                Firebase Project            │
│  ┌────────────┐  ┌────────────┐  ┌──────┐  │
│  │  Hosting   │  │  Firebase  │  │ Sec. │  │
│  │ (CDN Cache)│  │    Auth    │  │Rules │  │
│  └────┬───────┘  └────┬───────┘  └──────┘  │
│       │               │ (JWT ID Token)      │
│  ┌────┴───────────────┴──────────────────┐  │
│  │     Cloud Functions (Node.js 20)      │  │
│  └────┬───────────────┬──────────┬──────┘  │
│       │(Callable)     │(Triggers) │(Scheduled) │
│  ┌────┴────┐      ┌───┴────┐  ┌──┴────┐    │
│  │Firestore│      │ Cloud  │  │ Secret│    │
│  └─────────┘      │Storage │  │Manager│    │
└────────────────────────────────────────────┘
                     │ (Secure HTTPS API Calls)
┌────────────────────┴───────────────────────┐
│             External APIs (Zambia)         │
│ • ZRA Smart-Invoice (OAuth 2.0)            │
│ • NAPSA / WCFCB (SFTP/Portal)              │
│ • Mobile Money Gateways (MTN, Airtel)      │
└────────────────────────────────────────────┘
  
2.2 Frontend Architecture (React + Vite)
    • 2.2.1 Benefits of React + Vite:
        ◦ Instantaneous Development: Vite's dev server starts in under 300ms by leveraging native ES modules, eliminating long waits. Hot Module Replacement (HMR) is exceptionally fast, preserving component state across code changes.
        ◦ Highly Optimized Builds: Production builds utilize Rollup, which provides superior tree-shaking, automatic code-splitting for routes, and polyfills for dynamic imports, resulting in smaller, faster-loading bundles for end-users.
        ◦ Modern Tooling: Out-of-the-box support for TypeScript, PostCSS, and CSS Modules simplifies configuration and promotes best practices. The vibrant plugin ecosystem allows for easy extension (e.g., vite-plugin-pwa for offline capabilities).
    • 2.2.2 Component Structure (Atomic Design Pattern):
        ◦ src/components/atoms/: Reusable UI primitives (e.g., Button.tsx, Input.tsx, Badge.tsx).
        ◦ src/components/molecules/: Simple compositions of atoms (e.g., SearchBar.tsx, Pagination.tsx).
        ◦ src/components/organisms/: Complex UI components representing business logic (e.g., VehicleCard.tsx, InvoiceTable.tsx).
        ◦ src/components/templates/: Page layouts (e.g., DashboardLayout.tsx, AuthLayout.tsx).
        ◦ src/pages/: Route-level components (e.g., SalesPage.tsx, RepairDetailsPage.tsx).
        ◦ src/features/: Co-located logic for a specific domain, including Redux slices, custom hooks, and API service layers (e.g., src/features/invoicing/).
    • 2.2.3 State Management:
        ◦ Server Cache & API Layer: Redux Toolkit's RTK Query will manage all server state. It provides automatic caching, background re-fetching, optimistic updates, and loading/error state handling, drastically reducing boilerplate.
        ◦ UI State: Local, ephemeral state will be managed by React hooks (useState, useReducer).
        ◦ Global Context: React Context will be used for globally accessible, slowly changing state like the current tenant's configuration, theme, and user permissions.
    • 2.2.4 Routing:
        ◦ React Router v6 will be used for declarative, client-side routing.
        ◦ Features include nested layouts, protected routes (requiring authentication and specific roles), and lazy-loading of page components to improve initial load time.
        ◦ A clear URL structure will be enforced: /{tenantSlug}/sales, /{tenantSlug}/repairs/{jobId}.
    • 2.2.5 UI/UX:
        ◦ Design Philosophy: A desktop-first design targeting a 1440px viewport, fully responsive down to tablet size (1024x768).
        ◦ Accessibility: Adherence to WCAG 2.1 AA standards, including a color-blind-safe palette and a high-contrast mode toggle.
        ◦ Usability: Complex forms will be broken down into step-by-step wizards to guide users with lower technical literacy.
        ◦ Resilience: The application will feature an "offline queue" banner to inform users of intermittent connectivity, leveraging Firestore's offline cache to queue writes and ensure no data is lost.
2.3 Backend Architecture (Firebase)
    • 2.3.1 Firebase Services & Roles:
        ◦ Firestore: The primary database. Data is structured with tenant isolation as the core principle, using a tenantId field on every root-level document and enforced by security rules. Sub-collections will be used for one-to-many relationships (e.g., /repairs/{id}/partsUsed).
        ◦ Authentication: Manages user identity. Custom claims will be attached to user tokens to store role, tenantId, and granular permissions. Tenant-specific invitation links with expiry will be generated via Cloud Functions.
        ◦ Cloud Functions:
            ▪ Callable HTTPS Functions: For client-invoked actions requiring secure, server-side logic (e.g., creating an invoice, submitting to ZRA, processing a payment).
            ▪ Firestore Triggers (onCreate, onUpdate): For reactive logic, such as updating inventory stock when a part is used in a repair, or creating an audit log entry.
            ▪ Scheduled Functions: For nightly or monthly jobs, like generating NAPSA/WCFCB reports and emailing them to the tenant's accountant.
        ◦ Cloud Storage:
            ▪ Organized with tenant-specific folders: /{tenantId}/vehicles/{vin}/, /{tenantId}/invoices/{invoiceId}.pdf.
            ▪ The "Resize Images" Firebase Extension will be used to automatically create thumbnails for vehicle photos upon upload.
        ◦ Hosting: Will serve the static React application. Rewrites will be configured to direct specific paths (e.g., /download/invoice/...) to a Cloud Function that generates and serves a PDF file.
    • 2.3.2 API Design (Cloud Functions):
        ◦ Endpoint Naming Convention: A clear, REST-like naming convention will be used for callable functions:
            ▪ POST /api/v1/tenant/{tenantId}/sales – createSale
            ▪ POST /api/v1/tenant/{tenantId}/invoices/{invoiceId}/submitZRA – submitInvoiceToZRA
            ▪ GET /api/v1/tenant/{tenantId}/reports/napsa?month=YYYY-MM – generateNapsaReport
        ◦ Security:
            ▪ Every function will first verify the Firebase ID token from the Authorization header.
            ▪ The function will then check that the tenantId in the user's custom claims matches the tenantId in the request path.
            ▪ Rate limiting will be enforced using Firebase App Check and custom tenant-level quotas.
    • 2.3.3 Database Design (Firestore Schema):
Collection	Document ID	Key Fields & Data Types	Description
users	{uid}	tenantId, role (enum), displayName, email, phone, createdAt, lastLoginAt	User accounts with roles scoped to a single tenant.
tenants	{tenantId}	name, slug, logoUrl, plan (enum), isActive, address, TPIN (ZRA)	The root entity for each subscribing business.
vehicles	{vehicleId}	tenantId, vin, regNumber, make, model, year, status (enum), costPrice, sellingPrice, images (array)	Inventory of vehicles for sale.
customers	{customerId}	tenantId, name, phone, nrc, address, vehiclesOwned (array of vehicleIds)	The business's customer database.
inventories	{inventoryId}	tenantId, type (part/tool), sku, name, currentStock, reorderLevel, supplierId, cost, sellingPrice	Stock of parts, consumables, and tools.
suppliers	{supplierId}	tenantId, name, contactPerson, email, paymentTerms	List of parts and service suppliers.
repairs	{repairId}	tenantId, customerId, vehicleId, status (enum), reportedIssues, createdAt, closedAt	The master document for a repair job.
↳ jobCards	{jobCardId}	mechanicId, description, estimatedHours, actualHours, rate, totalLabour	Sub-collection for labor items on a repair.
↳ partsUsed	{partUsedId}	inventoryId, qty, unitCost, totalCost	Sub-collection for parts used on a repair.
sales	{saleId}	tenantId, customerId, vehicleId, salePrice, deposit, balance, status (enum)	Records a vehicle sale transaction.
invoices	{invoiceId}	tenantId, saleId OR repairId, invoiceNumber, totalAmount, taxBreakdown (map), markId (ZRA), dueDate	Financial invoice, linked to a sale or repair.
payments	{paymentId}	tenantId, invoiceId, amount, method (enum), reference	Records a payment against an invoice.
auditLogs	{logId}	tenantId, actorUid, entityType, entityId, action (enum), diff (map), timestamp	Immutable log of all critical system actions.
    • Indexes:
        ◦ Composite index on repairs(tenantId, status, createdAt) for efficient dashboard queries.
        ◦ Composite index on inventories(tenantId, sku) for fast part lookups.
        ◦ Single-field tenantId index on all top-level collections, mandated by security rules.
3. Core Features & Modules (Granular Detail)
    • 3.1 Sales Management:
        ◦ Vehicle catalog with faceted search (make, model, year, price range).
        ◦ A trade-in valuation calculator based on vehicle age, mileage, and condition.
        ◦ Multi-currency quotation generation (ZMW & USD) with printable PDF output.
        ◦ Instalment payment plan generator with configurable interest rates and tenures.
    • 3.2 Repair & Service:
        ◦ Ability to clone previous job cards for recurring services (e.g., "30,000 km Service").
        ◦ Visual mechanic and service bay calendar with drag-and-drop scheduling.
        ◦ Real-time parts availability check from the job card interface.
        ◦ Automated SMS/WhatsApp notifications to customers on status changes (e.g., "Ready for Collection") via an integration like Africa's Talking.
    • 3.3 Inventory Management:
        ◦ Support for FIFO (First-In, First-Out) costing method.
        ◦ Barcode/QR code scanning using the device camera or a connected USB scanner for quick part identification.
        ◦ Automated low-stock reports emailed to managers when currentStock falls below reorderLevel.
        ◦ Tool tracking module with a digital check-in/check-out log assigned to mechanics.
    • 3.4 Customer Relationship Management (CRM):
        ◦ Customer segmentation based on behavior (e.g., new buyer, service-only, inactive > 90 days).
        ◦ Automated reminders for birthdays and upcoming service due dates.
        ◦ Explicit consent capture for marketing communications, aligning with data protection principles.
    • 3.5 Financial Management:
        ◦ Automated VAT computation at the standard 16% rate.
        ◦ Direct API integration with the ZRA Smart-Invoice system using OAuth 2.0 for authentication.
        ◦ A simple payroll module that calculates and splits the 10% NAPSA contribution (5% employee, 5% employer).
        ◦ Automated calculation of WCFCB assessments based on gross wages.
4. Regulatory Compliance (Zambia)
    • 4.1 ZRA Smart-Invoice:
        ◦ The system will handle the real-time submission of invoice data to the ZRA API, using an idempotency key to prevent duplicate submissions.
        ◦ The returned QR code and Mark ID will be stored and rendered on all digital and printed invoices.
        ◦ An offline queue will be implemented; if the ZRA API is unreachable, the system will retry submission for up to 48 hours.
    • 4.2 NAPSA:
        ◦ A Cloud Function will be scheduled to run monthly, generating a NAPSA-compliant CSV file of employee contributions.
        ◦ This file will be automatically emailed to the tenant's registered HR/accountant email address.
    • 4.3 WCFCB:
        ◦ The system will pre-fill the annual "Form 14" (Return of Earnings) with data from the payroll module, ready for digital submission.
    • 4.4 Data Protection Act (2021):
        ◦ All data is encrypted at rest (AES-256) and in transit (TLS 1.3) by default within Firebase.
        ◦ A "right-to-be-forgotten" workflow will be implemented, allowing for a soft-delete of customer data, followed by a permanent purge after a 30-day grace period.
5. User Management & Security
    • 5.1 Multi-Tenant Data Privacy:
        ◦ Data is strictly segregated using a tenantId on every document. Direct path access (e.g., /repairs/{id}) will be disallowed by security rules; all queries must be scoped to the tenant.
        ◦ Firestore Security Rule Snippet (Enforced Globally):
code Code
downloadcontent_copyexpand_less
IGNORE_WHEN_COPYING_START
IGNORE_WHEN_COPYING_END
    match /databases/{db}/documents/{path=**} {
  allow read, write: if request.auth != null &&
                        request.auth.token.tenantId == resource.data.tenantId;
}
  
        ◦ Cloud Functions will programmatically enforce this same tenantId check on every operation to prevent any server-side data leakage.
    • 5.2 Authentication & Role-Based Access Control (RBAC):
        ◦ Custom claims will be set on a user's token by an admin-only Cloud Function:
setCustomUserClaims(uid, { tenantId, role, permissions: ['create_invoice', 'delete_vehicle'] })
        ◦ Role Matrix:
            ▪ Admin: Full access within their tenant.
            ▪ Manager: Full access, except for tenant deletion or subscription management.
            ▪ Cashier: Access to sales, customer, and payment modules only.
            ▪ Mechanic: Read-only access to vehicles; write access to their assigned job cards.
            ▪ Accountant: Read-only access to all modules; write access to financial reports and payroll.
    • 5.3 Data Security:
        ◦ Automated daily backups of the Firestore database will be configured via managed export to a separate Cloud Storage bucket.
        ◦ Backup retention policy will be set to 30 days, with the destination bucket configured for cross-region replication for disaster recovery.
        ◦ All sensitive third-party API keys (ZRA, mobile money gateways) will be stored securely in Google Cloud's Secret Manager, accessible only by specific Cloud Functions.
        ◦ Firebase App Check will be enforced on all callable functions to ensure requests originate from the legitimate application.
    • 5.4 Common Vulnerability Mitigation:
        ◦ XSS: React's default JSX encoding prevents script injection. A strict Content Security Policy (CSP) will be set in firebase.json.
        ◦ CSRF: Not applicable, as the system uses stateless JWTs in headers for authentication, not session cookies.
        ◦ Rate Limiting: Implemented at the Cloud Function level to prevent abuse (e.g., 100 requests/minute per IP, 1000 API calls/day per tenant on the free tier).
6. Deployment & Scalability
    • 6.1 CI/CD Pipeline:
        ◦ A GitHub Actions workflow will trigger on every push to the main branch.
        ◦ Workflow Steps:
            1. Checkout code.
            2. Install dependencies (pnpm install).
            3. Run linters and tests.
            4. Build the React application (pnpm build).
            5. Deploy to Firebase Hosting and Cloud Functions using the Firebase CLI.
    • 6.2 Environment Strategy:
        ◦ Development: Local development using the Firebase Emulator Suite.
        ◦ Preview: Each pull request automatically deploys to a temporary Firebase Hosting preview channel for review.
        ◦ Staging: A dedicated Firebase project with synthetic data, reset nightly.
        ◦ Production: The main customer-facing Firebase project.
    • 6.3 Scalability:
        ◦ Firestore: Automatically scales to millions of concurrent connections and terabytes of data.
        ◦ Cloud Functions (2nd Gen): Support up to 1,000 concurrent requests per instance, with configurable auto-scaling.
        ◦ Hosting CDN: Firebase Hosting's global CDN ensures fast static asset delivery worldwide, with a target cache-hit rate of >99%.
        ◦ Horizontal Scaling: The architecture allows for future expansion to a multi-region Firestore deployment (e.g., nam5 and eur3) if the user base grows globally.
    • 6.4 Monitoring & Alerting:
        ◦ Performance: Firebase Performance Monitoring will track web vitals (LCP, FID) and API call latency.
        ◦ Errors: Sentry or a similar service will be integrated for real-time error tracking and reporting.
        ◦ Logging: Cloud Logging will capture all function logs. Sinks will be configured to stream critical logs to BigQuery for long-term analysis.
        ◦ Alerting: Firebase Alerts will be configured to trigger notifications (via PagerDuty or Slack) for critical events like high function error rates or uptime check failures.
7. Future Enhancements
    • Mobile Companion App: A React Native application for mechanics to update job cards, upload photos of repairs, and clock in/out of jobs directly from the workshop floor.
    • AI-Powered Insights: A module using vehicle service history and mileage to provide predictive maintenance recommendations (e.g., "Brake pads likely need replacement in the next 2,000 km").
    • Fintech Integration: Partnering with local financial institutions to provide open-banking integration for instant customer loan approvals for vehicle purchases or major repairs.
    • Marketplace Module: Allowing established workshops to rent out unused service bays to vetted, third-party freelance mechanics on an hourly basis.
    • Voice Integration: Allowing mechanics to add notes to job cards using voice commands in local languages (Bemba, Nyanja), converted to text using Google's Vertex AI.
    • True Offline POS Mode: Enhancing the Firestore persistent cache with a more robust background synchronization strategy to allow remote rural shops to operate fully offline for extended periods.
