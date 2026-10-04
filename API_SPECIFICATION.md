# SKIPQ — REST API SPECIFICATION & ARCHITECTURE CONTRACT

## Base URL
`/api`

## Authentication
JWT Bearer token via Amazon Cognito User Pools (`Authorization: Bearer <token>`).
Roles: `student` or `staff`.

---

## 1. Orders

### `GET /api/orders`
Returns orders list with optional filtering.
- Query params:
  - `status`: `PENDING` | `ACCEPTED` | `PAYMENT_VERIFIED` | `PRINTING` | `READY_FOR_PICKUP` | `COLLECTED` | `REJECTED` | `CANCELLED`
  - `studentId`: Filter by student user ID
- Response:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "ord_1042",
        "token": "XR-1042",
        "studentId": "usr_student_1",
        "studentName": "Prem Sai",
        "studentEmail": "prem.sai@campus.edu",
        "studentPhone": "+91 98765 43210",
        "documents": [
          {
            "id": "doc_1",
            "name": "Database_Systems_Assignment_4.pdf",
            "size": 1850000,
            "type": "application/pdf",
            "pages": 4,
            "uploadedAt": "2026-09-11T09:52:00Z"
          }
        ],
        "config": {
          "service": "PRINT",
          "color": "COLOR",
          "paperSize": "A4",
          "sides": "DOUBLE",
          "copies": 2,
          "finishing": "STAPLE",
          "instructions": "Staple top-left"
        },
        "pricing": {
          "totalSheets": 4,
          "baseCost": 20,
          "colorSurcharge": 60,
          "paperSurcharge": 0,
          "duplexAdjustment": 3,
          "copies": 2,
          "finishingCost": 10,
          "total": 87
        },
        "status": "PRINTING",
        "paymentMethod": "UPI",
        "paymentStatus": "VERIFIED",
        "estimatedMinutes": 12,
        "queuePosition": 4,
        "createdAt": "2026-09-11T09:52:00Z",
        "updatedAt": "2026-09-11T10:02:00Z",
        "pickupCounter": "Counter #2 (Main Desk)",
        "otpCode": "7419"
      }
    ]
  }
  ```

### `GET /api/orders/:id`
Returns single order detail by order ID or token.

### `POST /api/orders`
Creates a new printing/Xerox order and assigns the next queue token (`XR-XXXX`).

### `PATCH /api/orders/:id/status`
Updates lifecycle status.
- Body:
  ```json
  {
    "status": "READY_FOR_PICKUP",
    "rejectionReason": "Optional string if status is REJECTED"
  }
  ```

### `POST /api/orders/:id/payment/verify`
Confirms payment verification by staff operator.

---

## 2. Queue

### `GET /api/queue`
Returns active ordered list of tokens in processing pipeline.

---

## 3. Operational Analytics

### `GET /api/metrics`
Returns counter performance metrics:
- `pendingCount`
- `printingCount`
- `readyCount`
- `completedTodayCount`
- `todayRevenue`
- `avgWaitMinutes`
- `colorPercentage`
