# SKIPQ / XEROXFLOW — REST API SPECIFICATION

## Base URL
`/api/v1` (with `/api` as backward-compatible alias)

## Authentication & Authorization
- **Type**: Bearer JWT (`Authorization: Bearer <token>`)
- **Roles**: `student`, `staff`, `admin`
- **Account Status**: `active`, `deactivated`
- **Error Responses**:
  - `401 Unauthorized`: Missing, invalid, or expired authentication token.
  - `403 Forbidden`: Authenticated user lacks required role, account deactivated, or unauthorized resource access.
  - `400 Bad Request`: Validation failure or illegal state transition.
  - `404 Not Found`: Requested resource does not exist.

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/register`
Public student registration. Always creates `role = 'student'` and `status = 'active'`.
- **Body**: `{ "name": "string", "email": "string", "password": "min 6 chars", "department"?: "string", "collegeId"?: "string", "phone"?: "string" }`
- **Response**: `{ "success": true, "data": { "user": User, "token": string } }`

### `POST /api/v1/auth/login`
Authenticates email and password using bcrypt. Returns generic 401 on error.
- **Body**: `{ "email": "string", "password": "string" }`
- **Response**: `{ "success": true, "data": { "user": User, "token": string } }`

### `GET /api/v1/auth/me`
Returns current authenticated user profile.
- **Headers**: `Authorization: Bearer <token>`

### `POST /api/v1/auth/google-sync`
Synchronizes authenticated Google user identity.

### `POST /api/v1/auth/admin/bootstrap`
Bootstrap initial administrator account using server secret key.
- **Body**: `{ "bootstrapKey": "string", "name": "string", "email": "string", "password": "min 6 chars" }`

---

## 2. Administration & Staff Provisioning (Admin Only)

### `POST /api/v1/admin/staff`
Provision an authorized staff member.
- **Headers**: `Authorization: Bearer <admin_token>`
- **Body**: `{ "name": "string", "email": "string", "department"?: "string", "collegeId"?: "string", "phone"?: "string", "password"?: "string" }`
- **Response**: `{ "success": true, "data": User }`

### `PATCH /api/v1/admin/staff/:userId/deactivate`
Deprovision a staff member. Downgrades role to `student` while preserving account, historical orders, and active status.
- **Headers**: `Authorization: Bearer <admin_token>`

### `GET /api/v1/admin/staff`
List current campus stationery staff members.

---

## 3. Orders

### `POST /api/v1/orders`
Create a new print order. Student ID is derived from authenticated user token.
- **Initial Status**: `PENDING`, `paymentStatus = 'PENDING'`

### `GET /api/v1/orders`
List orders. Students strictly receive only their own orders. Staff/Admin receive all campus orders.

### `GET /api/v1/orders/:id`
Get single order. Students can access only their own order.

### `PATCH /api/v1/orders/:id/status` (Staff & Admin Only)
Operational state machine transition:
`PENDING` → `ACCEPTED` → `PAYMENT_VERIFIED` → `PRINTING` → `READY_FOR_PICKUP` → `COLLECTED`
Terminal states: `COLLECTED`, `REJECTED`, `CANCELLED`.
- **Body**: `{ "status": "string", "rejectionReason"?: "string" }`

### `POST /api/v1/orders/:id/verify-payment` (Staff & Admin Only)
Verify student payment at counter.

### `POST /api/v1/orders/:id/cancel`
Cancel an order (Students can cancel only their own order in `PENDING` status).

---

## 4. Documents & Storage

### `POST /api/v1/documents/upload`
Upload document (PDF, PNG, JPG up to 50MB).
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Multipart FormData with `file` field.

### `GET /api/v1/documents/file/:filename`
Authenticated document stream. Verifies student owns an order referencing the document or requester is staff/admin.

---

## 5. Queue & Operational Analytics

### `GET /api/v1/queue`
Live queue list. Sanitized for students (hiding OTP, document URLs, personal contact details).

### `GET /api/v1/analytics` (Staff & Admin Only)
Returns campus print metrics, volume counts, and revenue totals.
