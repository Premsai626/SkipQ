# SKIPQ / XEROXFLOW — REST API SPECIFICATION

## Base URL

`/api/v1` (with `/api` as backward-compatible alias)

## Authentication & Authorization

- **Type**: Bearer JWT (`Authorization: Bearer <token>`)
- **Roles**: `student`, `staff` (strict 2-role architecture)
- **Account Status**: `active`, `deactivated`
- **Error Responses**:
  - `401 Unauthorized`: Missing, invalid, or expired authentication token.
  - `403 Forbidden`: Authenticated user lacks required role, account deactivated, or unauthorized resource access.
  - `400 Bad Request`: Validation failure or illegal state transition.
  - `404 Not Found`: Requested resource does not exist.

---

## 1. Authentication & Profile Endpoints

### `POST /api/v1/auth/register`

Account registration for students and staff.

**Request Body**:

```json
{
  "name": "string (min 2 chars)",
  "email": "string (valid email)",
  "password": "string (min 6 chars)",
  "role": "'student' | 'staff' (default: 'student')",
  "department": "string (optional)",
  "collegeId": "string (optional)",
  "phone": "string (optional)",
  "institution": "string (optional)",
  "yearOfStudy": "string (optional)"
}
```

**Response**: `{ "success": true, "data": { "user": User, "token": string } }`

### `POST /api/v1/auth/login`

Authenticates email and password using bcrypt. Returns generic 401 on error.

- **Body**: `{ "email": "string", "password": "string" }`
- **Response**: `{ "success": true, "data": { "user": User, "token": string } }`

### `POST /api/v1/auth/google-sync` (Alias: `POST /api/v1/auth/google/sync`)

Cryptographically validates a Supabase session token and provisions/synchronizes user profile.

- **Body**: `{ "supabaseToken": "string", "role"?: "'student' | 'staff'", "name"?: "string", "department"?: "string" }`

### `GET /api/v1/auth/me`

Returns current authenticated user profile.

- **Headers**: `Authorization: Bearer <token>`

### `GET /api/v1/profiles/:id`

Fetch profile details by user ID. Students can view only their own profile; staff can access profile data.

### `PATCH /api/v1/profiles/me` (Alias: `PATCH /api/v1/auth/profile`)

Update own editable profile fields (`name`, `department`, `collegeId`, `phone`, `institution`, `yearOfStudy`, `profilePhoto`). Role and status escalation attempts are rejected.

---

## 2. Shared Stationery Store Catalog

### `GET /api/v1/store/items`

List store items. All authenticated users can view items. Students see only available items (`isAvailable = true`).

- **Query Parameters**:
  - `category` (optional, e.g. "Lab Apparel", "Notebooks & Records")
  - `search` (optional search query)
  - `availableOnly` (optional boolean, staff only)

### `GET /api/v1/store/items/:id`

Retrieve single stationery item by ID.

### `POST /api/v1/store/items` (Staff Only)

Add new stationery item to campus catalog.

- **Body**: `{ "name": "string", "description"?: "string", "category": "string", "price": number, "stock": number, "imageUrl"?: "string", "isAvailable"?: boolean }`

### `PATCH /api/v1/store/items/:id` (Staff Only)

Update price, stock, description, or availability of a catalog item.

### `DELETE /api/v1/store/items/:id` (Staff Only)

Delete an item from the stationery catalog.

---

## 3. Orders (Print & Stationery)

### `POST /api/v1/orders`

Create a new print or stationery order. Student ID is derived from verified JWT.

**Print Order Body**:

```json
{
  "orderType": "PRINT",
  "documents": [{ "id": "doc_...", "name": "...", "size": 1234, "type": "application/pdf", "pages": 10 }],
  "config": { "service": "PRINT", "color": "BW", "paperSize": "A4", "sides": "DOUBLE", "copies": 1, "finishing": "NONE" },
  "paymentMethod": "UPI",
  "pickupCounter": "Counter #2 (Main Desk)"
}
```

**Store Order Body**:

```json
{
  "orderType": "STORE",
  "items": [{ "itemId": "item_apron_01", "quantity": 1 }],
  "paymentMethod": "UPI"
}
```

### `GET /api/v1/orders`

List orders. Students receive strictly only their own orders. Staff receive all campus orders with filtering options.

### `GET /api/v1/orders/:id`

Get single order by ID or Token. Students can access only their own order; staff can view all orders.

### `PATCH /api/v1/orders/:id/status` (Staff Only)

Operational state machine transition:
`PENDING` → `ACCEPTED` → `PAYMENT_VERIFIED` → `PRINTING` → `READY_FOR_PICKUP` → `COLLECTED`
Terminal states: `COLLECTED`, `REJECTED`, `CANCELLED`.

- **Body**: `{ "status": "string", "rejectionReason"?: "string" }` (Rejection reason mandatory when declining).

### `POST /api/v1/orders/:id/verify-payment` (Staff Only)

Verify student payment at counter and transition order to `ACCEPTED`.

### `POST /api/v1/orders/:id/cancel`

Cancel an order (Students can cancel only their own order while still in `PENDING` status).

---

## 4. Documents & Storage

### `POST /api/v1/documents/upload`

Upload document (PDF, PNG, JPG up to 50MB). Persists metadata and stores file in private bucket.

- **Headers**: `Authorization: Bearer <token>`
- **Body**: Multipart FormData with `file` field.

### `GET /api/v1/documents/:documentId/view`

Protected document access endpoint. Generates short-lived signed URLs or streams local files.

- Document owner can view their own uploaded document.
- Staff can access documents tied to active campus orders.
- Unrelated users are rejected with `403 Forbidden`.

### `GET /api/v1/documents/file/:filename`

Direct authenticated streaming route for documents. Enforces the same ownership and staff processing rules.

---

## 5. Authoritative Pricing Engine

### `POST /api/v1/pricing/calculate`

Authoritative server calculation of print costs, sheets, duplex discounts, finishing surcharges, and estimated turnaround time.

- **Body**: `{ "documents": [...], "config": { ... } }`

---

## 6. Queue & Operational Analytics

### `GET /api/v1/queue`

Live queue list. Sanitized for students (hiding OTP pickup codes, private document paths, and contact details of other students).

### `GET /api/v1/analytics` (Staff Only)

Returns campus print metrics, queue counts, color distribution, and daily revenue totals.

---

## 7. Notifications

### `GET /api/v1/notifications`

Fetch notifications for the authenticated user.

### `PATCH /api/v1/notifications/:id/read`

Mark a notification as read. Users can only update their own notifications.

---

## 8. SkipQ AI Assistant (Gemini Powered)

### `GET /api/v1/ai/status`

Check real-time configuration and health status of SkipQ AI assistant.

- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ "success": true, "data": { "configured": true, "model": "gemini-3.5-flash", "service": "SkipQ AI Assistant (Gemini)", "userRole": "student" | "staff" } }`

### `POST /api/v1/ai/chat`

Conversational assistant endpoint executing server-side agentic function calling loop.

- **Headers**: `Authorization: Bearer <token>`
- **Rate Limit**: 30 requests per minute
- **Request Body**:

```json
{
  "message": "string (1-2000 chars)",
  "conversationHistory": [
    {
      "role": "'user' | 'assistant' | 'system'",
      "content": "string (max 2000 chars)"
    }
  ]
}
```

- **Response**:

```json
{
  "success": true,
  "data": {
    "message": "string (Markdown formatted assistant response)",
    "data": {
      "products": [],
      "orders": [],
      "navigationTarget": null,
      "printEstimate": null
    },
    "model": "gemini-3.5-flash",
    "timestamp": "ISO timestamp"
  }
}
```
