# 🖨️ SkipQ — Campus Print & Stationery Platform

> **Skip the queue. Upload. Order. Track. Collect.**

**SkipQ** is a production-ready, full-stack digital Xerox and stationery ordering platform designed for college campus students and Xerox shop operators. It completely eliminates physical waiting queues by digitizing document uploads, print configurations, real-time authoritative pricing, finite-state queue management, and counter OTP verification.

---

## 🌟 Key Features

### 🎓 Student Experience
- **Multi-Step Order Wizard**: Drag-and-drop document upload (PDF, JPG, PNG, DOCX) with page count detection.
- **Granular Print Configuration**: Laser Print vs Photocopy, Black & White vs Full Color, A4 vs A3 paper, Single vs Duplex eco printing, custom copy count, and finishing services (Stapling, Spiral Binding, Thermal Lamination).
- **Authoritative Real-Time Pricing**: Itemized price calculations (base rate, color surcharges, duplex discount, finishing, GST) calculated and synchronized server-side.
- **Simulated Payment Gateway**: Instant UPI QR code, Campus Card, or Cash at Counter.
- **Live Queue Tracking**: Track order status across a 6-stage lifecycle (`PENDING` → `ACCEPTED` → `PAYMENT_VERIFIED` → `PRINTING` → `READY_FOR_PICKUP` → `COLLECTED`) with live queue position and 4-digit pickup OTP.

### 🏢 Staff Operational Command Hub
- **Executive Metrics**: Live counts for Pending Orders, Printing Now, Ready for Pickup, Completed Today, and Campus Revenue.
- **High-Density Order Management**: Searchable and filterable data table with 1-click status actions.
- **Slide-Over Inspection Drawer**: Review file details, inspect/download documents, and check student instructions.
- **Mandatory Rejection Modal**: Enforces reason capture when rejecting damaged/unsupported files.
- **3-Lane Kanban Queue Board**: Visual drag-and-advance queue board for Xerox shop operators.
- **Operational Analytics**: Print volume trends, color vs B&W distribution, and service breakdown.

---

## 🏗️ Technical Architecture

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS with custom responsive UI components
- **State Management**: Context API (`AuthContext`, `OrderContext`) with 5-second polling synchronization
- **Routing**: React Router DOM (v7) with role-guarded routes

### Backend
- **Runtime**: Node.js & Express
- **Validation**: Strict schema validation using Zod
- **Authentication**: Stateless JWT Bearer tokens with `bcryptjs` password hashing
- **File Storage**: Multi-part uploads via `multer` with MIME validation and 50MB limits; extensible AWS S3 presigned URL support
- **Data Repositories**: Dual-driver architecture (`LocalOrderRepository` in-memory store for local development + `DynamoDBOrderRepository` adapter for AWS)
- **Containerization**: Multi-stage `Dockerfile` and `docker-compose.yml` serving both Express REST API and static React SPA bundle on a single port

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Docker (optional, for containerized deployment)

### Local Development Setup

```bash
# 1. Clone repository & install root dependencies
npm install

# 2. Install backend dependencies
cd backend && npm install && cd ..

# 3. Build the frontend production bundle
npm run build

# 4. Start the backend server (serves both API & React SPA on port 5001)
npm run start:backend
```

Navigate to **`http://localhost:5001`** in your browser.

---

## 🧪 Automated Testing

The backend includes a comprehensive 15-step end-to-end integration test suite verifying health, authentication, file processing, authoritative pricing, order creation, token retrieval, cash verification, state machine rules, rejection reasons, live queue position, and analytics:

```bash
node backend/test-api.js
```

**Test Results:**
```text
✅ PASS: Root Health Check
✅ PASS: Student Authentication & JWT issuance
✅ PASS: Staff Authentication
✅ PASS: Real Document Upload & Server File Processing
✅ PASS: Authoritative Pricing Engine Calculation
✅ PASS: Order Creation with Human Token (XR-1045) and OTP (9054)
✅ PASS: Retrieve Order by Human Token
✅ PASS: Staff Counter Cash Verification & Status to ACCEPTED
✅ PASS: Advance Order to PRINTING on Xerox machine
✅ PASS: Mark Order READY_FOR_PICKUP at collection desk
✅ PASS: State Machine Transition Guard (Rejects illegal rollback to PENDING)
✅ PASS: Finalize Order as COLLECTED
✅ PASS: Rejection Flow with Mandatory Operator Reason
✅ PASS: Live Queue API Returns Active Queue (5 active jobs)
✅ PASS: Operational Analytics API (86 completed, ₹3589 revenue)

=========================================
TEST SUMMARY: 15 PASSED, 0 FAILED
=========================================
```

---

## 🐳 Docker Deployment

To build and run the full-stack application in a production Docker container:

```bash
docker-compose up --build -d
```

The application will be accessible at `http://localhost:80`.

To stop the container:
```bash
docker-compose down
```

---

## 🛡️ Default Demo Credentials

For testing and grading:

| Role | Email | Password |
|---|---|---|
| **Student** | `student@campus.edu` | `student123` |
| **Staff** | `staff@campus.edu` | `staff123` |

---

## 📄 License
MIT License. Built for collegiate campus digital transformation.
