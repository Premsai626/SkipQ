# 🖨️ SkipQ — Campus Print & Stationery Platform

> **Skip the queue. Upload. Order. Track. Collect.**

**SkipQ** is a production-grade digital Xerox and stationery ordering platform designed for college campus students and Xerox shop operators. It digitizes document uploads, print configurations, real-time authoritative pricing, finite-state queue management, and counter OTP verification.

---

## 🌟 Key Features

### 🎓 Student Experience
- **Multi-Step Order Wizard**: Drag-and-drop document upload (PDF, JPG, PNG) with file validation and page count detection.
- **Granular Print Configuration**: Laser Print vs Photocopy, Black & White vs Full Color, A4 vs A3 paper, Single vs Duplex eco printing, custom copy count, and finishing services (Stapling, Spiral Binding, Thermal Lamination).
- **Authoritative Real-Time Pricing**: Itemized price calculations (base rate, color surcharges, duplex discount, finishing, GST) calculated and synchronized server-side.
- **Simulated Payment Gateway**: Demonstration payment workflows (simulated instant UPI QR code, Campus Card, or Cash at Counter). Note: This is an educational simulation, not real banking processing.
- **Live Queue Tracking**: Track order status across a 6-stage lifecycle (`PENDING` → `ACCEPTED` → `PAYMENT_VERIFIED` → `PRINTING` → `READY_FOR_PICKUP` → `COLLECTED`) with live queue position and 4-digit pickup OTP.

### 🏢 Staff Operational Command Hub
- **Executive Metrics**: Live counts for Pending Orders, Printing Now, Ready for Pickup, Completed Today, and Campus Revenue.
- **High-Density Order Management**: Searchable and filterable data table with 1-click status actions.
- **Slide-Over Inspection Drawer**: Review file details, inspect/download documents, and check student instructions.
- **Mandatory Rejection Modal**: Enforces reason capture when rejecting damaged/unsupported files.
- **3-Lane Kanban Queue Board**: Visual drag-and-advance queue board for Xerox shop operators.
- **Operational Analytics**: Print volume trends, color vs B&W distribution, and service breakdown.

---

## 🛡️ Security & Role Architecture

SkipQ enforces strict application security standards:

### Role & Account Status Model
- **Roles**: Exactly three roles: `student`, `staff`, `admin`. Role indicates authorization level, not status.
- **Status**: Separate account lifecycle status (`active` | `deactivated`).
- **Student Registration**: Normal registration always assigns `role = 'student'` and `status = 'active'`. Clients cannot supply or self-promote their role.
- **Staff Provisioning**: Staff accounts cannot be registered publicly. They are provisioned exclusively by authenticated administrators via `POST /api/v1/admin/staff`.
- **Staff Deprovisioning**: Admins deprovision staff via `PATCH /api/v1/admin/staff/:userId/deactivate`. Deprovisioned staff retain their account and order history, but their role becomes `student`, immediately revoking staff operational capabilities.
- **Server-Side Authoritative Checks**: Protected operations verify the user's current role and status directly against the database on each request, preventing old JWTs from retaining revoked privileges.
- **Password Security**: Passwords are encrypted with `bcryptjs`. Generic 401 messages prevent user enumeration.
- **Data Isolation**: Students can strictly view and cancel only their own orders and documents.
- **Zero Demo Credentials**: The platform contains no hardcoded demo credentials. Users register through standard authentication, and test accounts are provisioned programmatically.

---

## 🏗️ Technical Architecture

### Frontend
- **Framework**: React with TypeScript & Vite
- **Styling**: Tailwind CSS with custom responsive UI components
- **State Management**: Context API (`AuthContext`, `OrderContext`)
- **Routing**: React Router DOM with role-guarded routes

### Backend
- **Runtime**: Node.js & Express
- **Validation**: Strict schema validation using Zod
- **Authentication**: Stateless JWT Bearer tokens with `bcryptjs` password hashing
- **Security Headers & Protection**: `helmet` security headers, strict CORS origin controls, and IP rate limiting on authentication routes
- **File Storage**: Multi-part uploads via `multer` restricted to `.pdf`, `.png`, `.jpg`, and `.jpeg` (up to 50MB); authenticated document access preventing unauthorized downloads; Supabase Storage integration
- **Data Repositories**: Dual-driver architecture (`LocalOrderRepository` + `UserRepository` in-memory store for local development, and Supabase PostgreSQL / Storage adapter for cloud deployment)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Docker (optional, for containerized deployment)

### Local Development Setup

```bash
# 1. Install root frontend dependencies
npm install

# 2. Install backend dependencies
cd backend && npm install && cd ..

# 3. Build the frontend production bundle
npm run build

# 4. Start the backend server (serves API & SPA on port 5001)
npm run start:backend

# 5. (Optional) Run the Vite dev server with Hot Module Replacement on port 3000
npm run dev
```

Navigate to **`http://localhost:3000`** (dev server) or **`http://localhost:5001`** (production bundle).

---

## 🧪 Automated Testing

SkipQ includes an automated, programmatic test suite that creates isolated test accounts dynamically and verifies all security rules, role boundaries, staff provisioning/deprovisioning, and order state machines:

```bash
node backend/test-api.js
```

---

## 📄 License
MIT License. Built for collegiate campus digital transformation.
