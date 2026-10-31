# Hospital Dietary Department Meal Planning & Patient Allergy Verification API

A production-grade, secure, layered REST API built with Node.js, TypeScript, Express, Mongoose ODM, and MongoDB.

## 1. Architectural Overview

```text
HTTP Request (Client / Portal UI)
       │
       ▼
 [Helmet, CORS, RateLimiter, Winston Logger]
       │
       ▼
  [Auth & Role-Based Access Control]
       │
       ▼
  [Zod Validation Middleware]
       │
       ▼
  [Controllers]
       │
       ▼
   [Services]
   ├── AllergyVerificationService (Ingredient-level allergen collision & cross-contact engine)
   ├── RecommendationService (Disease contraindication & nutrient profile rules)
   ├── FoodService (Doctor food intake & recipe expansion)
   ├── ApprovalService (Clinical clearance state machine)
   ├── KitchenService (Active kitchen status & daily meal slots)
   ├── OrderService (7-point server-side validation & prep sheets)
   ├── FeedbackService (Delivered meal ratings & reviews)
   ├── NotificationService (Real-time clinical alerts)
   └── AuditLogService (HIPAA/hospital compliance audit log)
       │
       ▼
 [Repositories / Data Access]
       │
       ▼
 [Mongoose ODM Models / MongoDB Database]
```

## 2. MongoDB & Mongoose Architecture

The backend utilizes **MongoDB** as its primary persistent database, using **Mongoose** as the Object Document Mapper (ODM).

### Mongoose Models (`src/models/`):
- `User`: Accounts, credentials, roles, statuses, and indexes
- `Patient`: Patient clinical identifiers, room, age, and gender
- `Doctor`: Clinical department and medical license
- `KitchenStaff`: Food prep stations
- `Disease`: Clinical condition definitions
- `PatientDisease`: Patient-disease mapping with physician notes
- `Allergy`: Allergen dictionary
- `PatientAllergy`: Patient allergen sensitivity with severity levels (`MILD`, `MODERATE`, `SEVERE`, `CRITICAL`)
- `Food`: Nutritional breakdown (calories, protein, carbs, fat, sodium, sugar)
- `Ingredient`: Recipe ingredients
- `FoodIngredient`: Recipe ingredient relationships
- `DiseaseFoodRule`: Clinical diet guidelines (`RECOMMENDED`, `ALLOWED`, `AVOID`)
- `DoctorFoodApproval`: Attending physician meal sign-offs (`APPROVED`, `REJECTED`, `PENDING`)
- `KitchenAvailability`: Daily meal scheduling windows
- `KitchenStatus`: Operational status tracking
- `Order`: 7-point validated bedside patient orders
- `OrderStatusHistory`: Audited lifecycle order state transitions
- `Feedback`: Post-delivery patient ratings and clinical reviews
- `Notification`: Role-specific alerts and allergy warnings
- `AuditLog`: Immutable hospital audit trail

## 3. Database Operations & Scripts

- **Seed Database**:
  ```bash
  npm run db:seed
  ```
- **Postgres to MongoDB Migration**:
  ```bash
  npm run db:migrate
  ```
- **Test Database Models**:
  ```bash
  npm run test:db
  ```

## 4. Docker Compose Setup

Run local MongoDB and Mongo Express with:
```bash
docker-compose up -d
```
- MongoDB: `localhost:27017`
- Mongo Express GUI: `http://localhost:8081`

## 5. Supported Roles

1. **ADMIN** (`ADMIN`): Full portal administration, user status control (`ACTIVE`, `INACTIVE`, `SUSPENDED`), and system-wide audit inspection.
2. **DOCTOR** (`DOCTOR`): Patient chart diagnostics, disease and allergy assignment, meal clinical approval/rejection, food catalog expansion, and personalized dietary recommendations.
3. **KITCHEN** (`KITCHEN`): Global kitchen operational status (`ACTIVE`/`INACTIVE`), meal availability scheduling, order queue management (`PENDING` → `PREPARING` → `READY` → `DELIVERED`), and allergen isolation prep sheets.
4. **PATIENT** (`PATIENT`): Available safe food discovery (`GET /api/patient/available-foods`), bedside order placement, order progress tracking, and meal feedback.

## 6. Strict Server-Side Order Validation Sequence

Before creating an order via `POST /api/orders`, the backend strictly validates:

1. **Patient Exists**: Valid registered patient record in database.
2. **Food Exists & Active**: Valid meal listed in dietary catalog.
3. **Doctor Approval**: Food has an active `APPROVED` record by the attending physician for this patient.
4. **Allergy Verification Safe**: Zero ingredient-level allergen matches against patient's known allergies.
5. **Kitchen is Active**: Global kitchen status is `ACTIVE`.
6. **Food Availability Active**: Active schedule entry exists for the food item for the current date.
7. **Date Validation**: Current date strictly matches availability date (`YYYY-MM-DD`). Orders from past dates are rejected.
8. **Valid Meal Window**: Current system time falls between schedule `startTime` and `endTime`.

## 7. Key Endpoints

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user account |
| POST | `/api/auth/login` | Public | Authenticate and obtain JWT token |
| GET | `/api/auth/me` | All Authenticated | Get current authenticated user profile |
| GET | `/api/foods` | All Authenticated | List all active foods with nutritional data |
| POST | `/api/foods` | DOCTOR, ADMIN | Doctor adds new food and runs initial checks |
| GET | `/api/patient/available-foods` | PATIENT, DOCTOR, ADMIN | 7-point validated available foods for patient |
| GET | `/api/patient/recommendations` | PATIENT, DOCTOR, ADMIN | Disease and allergy compatible recommendations |
| POST | `/api/orders` | PATIENT, ADMIN | Place patient meal order with server revalidation |
| GET | `/api/orders/my-orders` | PATIENT | View patient order history |
| PUT | `/api/orders/:id/status` | KITCHEN, ADMIN | Transition order status (`PREPARING`, `READY`, `DELIVERED`) |
| GET | `/api/kitchen/orders` | KITCHEN, ADMIN | Kitchen order list with patient-specific prep warnings |
| GET | `/api/kitchen/orders/:orderId/prep-sheet` | KITCHEN, ADMIN | Detailed allergen prep sheet with cross-contact alerts |
| GET | `/api/kitchen/status` | All Authenticated | Check whether kitchen is currently active |
| PUT | `/api/kitchen/status` | KITCHEN, ADMIN | Toggle kitchen active status |
| POST | `/api/approvals` | DOCTOR, ADMIN | Doctor approves or rejects food for a patient |
| POST | `/api/feedback` | PATIENT, ADMIN | Submit rating (1-5) and comment on delivered orders |
| GET | `/api/notifications` | All Authenticated | Retrieve user notifications |
| GET | `/api/admin/audit-logs` | ADMIN | Review clinical and operational audit trail |

## 8. Seed Accounts (Pre-configured)

- **Admin**: `admin@hospital.com` / `Hospital@123`
- **Doctor**: `doctor@hospital.com` / `Hospital@123`
- **Kitchen**: `kitchen@hospital.com` / `Hospital@123`
- **Patient 1**: `patient@hospital.com` / `Hospital@123` (Eleanor Vance, Room 304-B, Severe Peanut Allergy)
- **Patient 2**: `robert.chen@hospital.com` / `Hospital@123` (Robert Chen, Room 412-A, Moderate Milk Allergy)
