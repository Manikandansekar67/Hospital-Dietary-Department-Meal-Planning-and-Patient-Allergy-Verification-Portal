# Hospital Dietary Department Meal Planning and Patient Allergy Verification Portal

An enterprise-grade clinical dietary management and allergen safety system for hospitals.

## Architecture

This project is organized into two dedicated folders:

```text
hospital-dietary-portal/
├── frontend/                     # React 19 SPA (Vite + Tailwind CSS + Lucide Icons)
│   ├── public/                  # Static assets and icons
│   ├── src/
│   │   ├── components/          # Reusable UI & clinical components
│   │   │   ├── common/          # Buttons, modals, badges, inputs
│   │   │   ├── layout/          # AppShell, Header, Sidebar
│   │   │   ├── food/            # FoodCard, DoctorApprovalModal
│   │   │   ├── allergy/         # AllergyAlert badges and banners
│   │   │   ├── kitchen/         # KitchenAllergyCard, Prep Sheets
│   │   │   └── order/           # OrderTimeline, FeedbackModal
│   │   ├── pages/               # Role-based dashboard & workflow pages
│   │   │   ├── auth/            # LoginPage & authentication
│   │   │   ├── admin/           # User, Patient, Food, Disease, Allergy management
│   │   │   ├── doctor/          # Recommendations, Add food, Clearances
│   │   │   ├── kitchen/         # Orders, Daily availability, Prep allergen screens
│   │   │   └── patient/         # Safe food menu, Order tracking, Dashboard
│   │   ├── services/            # Client API adapters & clinical engines
│   │   ├── store/               # AuthContext, KitchenContext, NotificationContext
│   │   ├── types/               # TypeScript domain interfaces
│   │   ├── utils/               # Allergy matching engine & formatting utilities
│   │   ├── constants/           # Clinical constants, allergens, seed presets
│   │   ├── App.tsx              # Application route tree
│   │   └── main.tsx             # React DOM entry point
│   ├── index.html               # Frontend HTML shell
│   ├── package.json             # Frontend package configuration
│   ├── tsconfig.json            # Frontend TypeScript configuration
│   ├── vite.config.ts           # Frontend Vite bundler configuration
│   └── .env.example             # Frontend environment variables template
│
├── backend/                      # Production Layered Express REST API (MongoDB + Mongoose)
│   ├── src/
│   │   ├── config/              # MongoDB connection & environment configuration
│   │   │   ├── database.ts      # Mongoose connection manager & event listeners
│   │   │   └── env.config.ts    # Environment variables (MONGODB_URI, JWT, etc.)
│   │   ├── models/              # Mongoose ODM schemas & models
│   │   │   ├── User.model.ts
│   │   │   ├── Patient.model.ts
│   │   │   ├── Doctor.model.ts
│   │   │   ├── KitchenStaff.model.ts
│   │   │   ├── Disease.model.ts
│   │   │   ├── PatientDisease.model.ts
│   │   │   ├── Allergy.model.ts
│   │   │   ├── PatientAllergy.model.ts
│   │   │   ├── Food.model.ts
│   │   │   ├── Ingredient.model.ts
│   │   │   ├── FoodIngredient.model.ts
│   │   │   ├── DiseaseFoodRule.model.ts
│   │   │   ├── DoctorFoodApproval.model.ts
│   │   │   ├── KitchenAvailability.model.ts
│   │   │   ├── KitchenStatus.model.ts
│   │   │   ├── Order.model.ts
│   │   │   ├── OrderStatusHistory.model.ts
│   │   │   ├── Feedback.model.ts
│   │   │   ├── Notification.model.ts
│   │   │   ├── AuditLog.model.ts
│   │   │   └── index.ts
│   │   ├── controllers/         # REST API route handlers
│   │   ├── middleware/          # JWT auth, RBAC, error handling, validation
│   │   ├── repositories/        # Mongoose ODM query repository layer
│   │   ├── routes/              # Express API route definitions
│   │   ├── services/            # Allergen collision engine & clinical services
│   │   ├── types/               # Backend data types and schemas
│   │   ├── utils/               # Winston logger, helpers
│   │   ├── validators/          # Zod request payload validators
│   │   ├── app.ts               # Express application builder
│   │   └── server.ts            # Backend HTTP server entry point
│   ├── scripts/
│   │   ├── seed.ts              # MongoDB seed script
│   │   └── migrate-from-postgres.ts # Postgres to MongoDB migration script
│   ├── tests/
│   │   └── database.test.ts     # Mongoose models validation test suite
│   ├── package.json             # Backend package configuration
│   ├── tsconfig.json            # Backend TypeScript configuration
│   ├── README.md                # Backend API documentation
│   └── .env.example             # Backend environment variables template
│
├── docker-compose.yml           # Docker services (MongoDB 7 & Mongo Express)
├── server.ts                    # Root full-stack dev/prod runner
├── package.json                 # Root orchestration package
└── README.md                    # System documentation
```

## Database Migration to MongoDB & Mongoose

This project has been migrated from PostgreSQL and Prisma to **MongoDB** with **Mongoose ODM**:
- **Zero Prisma Dependencies**: Completely replaced Prisma operations with native Mongoose ODM models and queries.
- **Resilient Multi-Mode Data Access**: Operates seamlessly against a local or remote MongoDB instance via `MONGODB_URI`, while maintaining in-memory fallback during quick dev previews or cold starts.
- **Docker Compose**: Pre-configured `docker-compose.yml` launches a MongoDB 7 instance on port 27017 and Mongo Express on port 8081.
- **Migration & Seed Tools**: Included `npm run db:seed` and `npm run db:migrate` utilities.

## Getting Started

### 1. Start MongoDB via Docker (Optional)

```bash
docker-compose up -d
```

### 2. Run the Full-Stack Application

```bash
npm run dev
```

The application will be accessible at:
- **Full-Stack Application**: `http://localhost:3000`
- **Backend API**: `http://localhost:3000/api`
- **API Health**: `http://localhost:3000/api/health`

### 3. Run Database Tests & Seeds

```bash
npm run test:db
npm run db:seed
```

## Demo Credentials

- **Admin**: `admin@hospital.com` / `Hospital@123`
- **Doctor**: `doctor@hospital.com` / `Hospital@123`
- **Kitchen**: `kitchen@hospital.com` / `Hospital@123`
- **Patient 1**: `patient@hospital.com` / `Hospital@123` (Eleanor Vance, Room 304-B, Severe Peanut Allergy)
- **Patient 2**: `robert.chen@hospital.com` / `Hospital@123` (Robert Chen, Room 412-A, Moderate Milk Allergy)
