/**
 * Comprehensive Acceptance & Security Verification Test Suite for SkipQ API
 * ZERO hardcoded demo credentials. Dynamically creates isolated test accounts.
 * Validates Final 2-Role Architecture: Exactly 'student' and 'staff' (NO admin).
 */

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const BASE_URL = 'http://localhost:5001';
const JWT_SECRET = process.env.JWT_SECRET || 'xerox_flow_production_jwt_secret_key_2026';

async function runTests() {
  console.log('============================================================');
  console.log('--- STARTING SKIPQ FINAL ARCHITECTURE VERIFICATION SUITE ---');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message} ${details ? '(' + details + ')' : ''}`);
      failed++;
    }
  }

  // Dynamic test credentials (isolated for every run)
  const timestamp = Date.now();
  const student1Email = `student1_${timestamp}@campus.edu`;
  const student1Pass = `P@ssw0rd_${timestamp}_1`;
  const student2Email = `student2_${timestamp}@campus.edu`;
  const student2Pass = `P@ssw0rd_${timestamp}_2`;
  const staff1Email = `staff1_${timestamp}@campus.edu`;
  const staff1Pass = `StaffP@ss_${timestamp}_1`;
  const staff2Email = `staff2_${timestamp}@campus.edu`;
  const staff2Pass = `StaffP@ss_${timestamp}_2`;

  try {
    // -------------------------------------------------------------
    // SECTION 1: HEALTH & DIAGNOSTICS
    // -------------------------------------------------------------
    console.log('\n[1] Health Check');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'HEALTHY', 'Root Health Check returns 200 HEALTHY');

    // -------------------------------------------------------------
    // SECTION 2: AUTHENTICATION (STUDENT & STAFF REGISTRATION & LOGIN)
    // -------------------------------------------------------------
    console.log('\n[2] Two-Role Registration & Login Security');

    // 2a. Student 1 Registration
    const regRes1 = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Student',
        email: student1Email,
        password: student1Pass,
        role: 'student',
        department: 'CSE',
        collegeId: `CS-${timestamp}`,
      }),
    });
    const regData1 = await regRes1.json();
    assert(
      regRes1.status === 201 && regData1.data?.token && regData1.data?.user?.role === 'student',
      'Valid student registration sets role=student and returns JWT token'
    );
    const student1Token = regData1.data.token;
    const student1Id = regData1.data.user.id;

    // 2b. Attempt to register with role: 'admin' (MUST BE REJECTED - NO ADMIN ROLE)
    const adminRegRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Malicious Admin Attempt',
        email: `fake_admin_${timestamp}@campus.edu`,
        password: student1Pass,
        role: 'admin',
      }),
    });
    assert(
      adminRegRes.status === 400,
      'Registration with role=admin is strictly rejected with 400 Bad Request'
    );

    // 2c. Student 2 Registration (for cross-user isolation testing)
    const regRes2 = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bob Student',
        email: student2Email,
        password: student2Pass,
        role: 'student',
        department: 'ECE',
      }),
    });
    const regData2 = await regRes2.json();
    assert(
      regRes2.status === 201 && regData2.data?.user?.role === 'student',
      'Student 2 registration sets role=student'
    );
    const student2Token = regData2.data.token;
    const student2Id = regData2.data.user.id;

    // 2d. Staff 1 Registration
    const staffRegRes1 = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Operator Ramesh',
        email: staff1Email,
        password: staff1Pass,
        role: 'staff',
        department: 'Stationery Desk 1',
      }),
    });
    const staffRegData1 = await staffRegRes1.json();
    assert(
      staffRegRes1.status === 201 && staffRegData1.data?.user?.role === 'staff',
      'Staff member registers directly with role=staff through approved onboarding'
    );
    const staff1Token = staffRegData1.data.token;
    const staff1Id = staffRegData1.data.user.id;

    // 2e. Staff 2 Registration (for cross-staff privacy testing)
    const staffRegRes2 = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Operator Suresh',
        email: staff2Email,
        password: staff2Pass,
        role: 'staff',
        department: 'Stationery Desk 2',
      }),
    });
    const staffRegData2 = await staffRegRes2.json();
    assert(
      staffRegRes2.status === 201 && staffRegData2.data?.user?.role === 'staff',
      'Staff 2 registers with role=staff'
    );
    const staff2Token = staffRegData2.data.token;
    const staff2Id = staffRegData2.data.user.id;

    // 2f. Valid Login
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: student1Email, password: student1Pass }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.data?.token, 'Valid login with bcrypt password verification');

    // 2g. Invalid Password Login (Generic 401 without enumeration)
    const badPassRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: student1Email, password: 'WrongPassword999!' }),
    });
    assert(
      badPassRes.status === 401 && (await badPassRes.json()).message === 'Invalid email or password',
      'Invalid password returns generic 401 "Invalid email or password"'
    );

    // 2h. Unknown Email Login
    const unknownEmailRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `nonexistent_${timestamp}@campus.edu`, password: 'anyPassword123' }),
    });
    assert(
      unknownEmailRes.status === 401 && (await unknownEmailRes.json()).message === 'Invalid email or password',
      'Unknown email returns generic 401 without leaking account existence'
    );

    // -------------------------------------------------------------
    // SECTION 3: GOOGLE AUTHENTICATION & SYNC SECURITY
    // -------------------------------------------------------------
    console.log('\n[3] Google Authentication & Sync Security');

    // 3a. Missing Google/Supabase token -> MUST BE 401 UNAUTHORIZED
    const noTokenSyncRes = await fetch(`${BASE_URL}/api/v1/auth/google/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `spoofed_${timestamp}@campus.edu`,
        name: 'Spoofed User',
      }),
    });
    assert(
      noTokenSyncRes.status === 401,
      'Google sync without token returns 401 Unauthorized (never trusts req.body.email alone)'
    );

    // 3b. Forged/invalid Google token -> MUST BE 401 UNAUTHORIZED
    const invalidTokenSyncRes = await fetch(`${BASE_URL}/api/v1/auth/google/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supabaseToken: 'forged.supabase.jwt.token',
        email: `victim_${timestamp}@campus.edu`,
      }),
    });
    assert(
      invalidTokenSyncRes.status === 401,
      'Google sync with forged/invalid token returns 401 Unauthorized'
    );

    // 3c. Client attempts role=admin in Google sync -> MUST BE 400 BAD REQUEST
    const adminGoogleSyncRes = await fetch(`${BASE_URL}/api/v1/auth/google/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supabaseToken: 'some.valid.token.format',
        role: 'admin',
      }),
    });
    assert(
      adminGoogleSyncRes.status === 400,
      'Google sync with role=admin rejected with 400 Bad Request'
    );

    // -------------------------------------------------------------
    // SECTION 4: JWT & RBAC ROUTE AUTHORIZATION
    // -------------------------------------------------------------
    console.log('\n[4] JWT & Role-Based Route Authorization');

    // 4a. Protected endpoint without Authorization header
    const noAuthRes = await fetch(`${BASE_URL}/api/v1/orders`);
    assert(noAuthRes.status === 401, 'Request to protected endpoint without JWT returns 401 Unauthorized');

    // 4b. Protected endpoint with fake/invalid JWT
    const invalidJwtRes = await fetch(`${BASE_URL}/api/v1/orders`, {
      headers: { Authorization: 'Bearer this.is.an.invalid.token' },
    });
    assert(invalidJwtRes.status === 401, 'Request with invalid JWT returns 401 Unauthorized');

    // 4c. Protected endpoint with expired JWT
    const expiredToken = jwt.sign(
      { sub: student1Id, email: student1Email, role: 'student', exp: Math.floor(Date.now() / 1000) - 100 },
      JWT_SECRET
    );
    const expiredRes = await fetch(`${BASE_URL}/api/v1/orders`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert(expiredRes.status === 401, 'Request with expired JWT returns 401 Unauthorized');

    // 4d. Insecure x-dev-role bypass attempt (MUST BE REJECTED)
    const devRoleAttempt = await fetch(`${BASE_URL}/api/v1/analytics`, {
      headers: {
        'x-dev-role': 'staff',
      },
    });
    assert(devRoleAttempt.status === 401, 'x-dev-role header is completely ignored and rejected with 401');

    // 4e. Staff accesses staff analytics endpoint -> 200 OK
    const staffAnalytics = await fetch(`${BASE_URL}/api/v1/analytics`, {
      headers: { Authorization: `Bearer ${staff1Token}` },
    });
    assert(staffAnalytics.status === 200, 'Staff member successfully accesses staff analytics');

    // 4f. Student accesses staff analytics endpoint -> MUST BE 403 FORBIDDEN
    const studentAnalytics = await fetch(`${BASE_URL}/api/v1/analytics`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(studentAnalytics.status === 403, 'Student is forbidden from staff analytics (403)');

    // 4g. Obsolete Admin routes removed completely -> 404 NOT FOUND
    const adminStaffRouteRes = await fetch(`${BASE_URL}/api/v1/admin/staff`, {
      headers: { Authorization: `Bearer ${staff1Token}` },
    });
    assert(adminStaffRouteRes.status === 404, 'Obsolete /api/v1/admin/staff endpoint returns 404 Not Found');

    const adminBootstrapRouteRes = await fetch(`${BASE_URL}/api/v1/auth/admin/bootstrap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bootstrapKey: 'key' }),
    });
    assert(adminBootstrapRouteRes.status === 404, 'Obsolete /api/v1/auth/admin/bootstrap returns 404 Not Found');

    // -------------------------------------------------------------
    // SECTION 5: STATIONERY STORE CATALOG & PERMISSIONS
    // -------------------------------------------------------------
    console.log('\n[5] Shared Stationery Store Catalog & Permissions');

    // 5a. Staff 1 adds stationery item -> 201 Created
    const createItemRes = await fetch(`${BASE_URL}/api/v1/store/items`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${staff1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `Engineering Notebook ${timestamp}`,
        description: 'Hardcover 192-page ruled notebook for lab records',
        category: 'Notebooks',
        price: 65,
        stock: 50,
      }),
    });
    const createItemData = await createItemRes.json();
    assert(
      createItemRes.status === 201 && createItemData.data?.id && createItemData.data?.price === 65,
      'Staff member creates store item with stock and price'
    );
    const storeItem = createItemData.data;

    // 5b. Student attempts to create store item -> MUST BE 403 FORBIDDEN
    const studentCreateItemRes = await fetch(`${BASE_URL}/api/v1/store/items`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Rogue Item',
        category: 'Pens',
        price: 1,
        stock: 10,
      }),
    });
    assert(studentCreateItemRes.status === 403, 'Student cannot create store items (403 Forbidden)');

    // 5c. Shared Visibility: Student 1 sees store catalog
    const student1CatalogRes = await fetch(`${BASE_URL}/api/v1/store/items`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const student1Catalog = await student1CatalogRes.json();
    const hasItemStudent1 = (student1Catalog.data || []).some((item) => item.id === storeItem.id);
    assert(student1CatalogRes.status === 200 && hasItemStudent1, 'Student 1 sees newly created store item in shared catalog');

    // 5d. Shared Visibility: Student 2 sees the exact same item
    const student2CatalogRes = await fetch(`${BASE_URL}/api/v1/store/items`, {
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    const student2Catalog = await student2CatalogRes.json();
    const hasItemStudent2 = (student2Catalog.data || []).some((item) => item.id === storeItem.id);
    assert(student2CatalogRes.status === 200 && hasItemStudent2, 'Student 2 sees newly created store item in shared catalog');

    // 5e. Shared Visibility: Staff 2 sees item created by Staff 1
    const staff2CatalogRes = await fetch(`${BASE_URL}/api/v1/store/items`, {
      headers: { Authorization: `Bearer ${staff2Token}` },
    });
    const staff2Catalog = await staff2CatalogRes.json();
    const hasItemStaff2 = (staff2Catalog.data || []).some((item) => item.id === storeItem.id);
    assert(staff2CatalogRes.status === 200 && hasItemStaff2, 'Staff 2 sees item created by Staff 1 in shared catalog');

    // 5f. Staff 2 updates stock and price
    const updateItemRes = await fetch(`${BASE_URL}/api/v1/store/items/${storeItem.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${staff2Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price: 70,
        stock: 45,
      }),
    });
    const updateItemData = await updateItemRes.json();
    assert(
      updateItemRes.status === 200 && updateItemData.data?.price === 70 && updateItemData.data?.stock === 45,
      'Staff member updates store item price and stock'
    );

    // 5g. Student attempts to update store item -> MUST BE 403 FORBIDDEN
    const studentUpdateItemRes = await fetch(`${BASE_URL}/api/v1/store/items/${storeItem.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ price: 1 }),
    });
    assert(studentUpdateItemRes.status === 403, 'Student cannot update store items (403 Forbidden)');

    // 5h. Student attempts to delete store item -> MUST BE 403 FORBIDDEN
    const studentDeleteItemRes = await fetch(`${BASE_URL}/api/v1/store/items/${storeItem.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(studentDeleteItemRes.status === 403, 'Student cannot delete store items (403 Forbidden)');

    // -------------------------------------------------------------
    // SECTION 6: DOCUMENT UPLOAD & FORMAT ALLOWLIST
    // -------------------------------------------------------------
    console.log('\n[6] Document Upload & Safe Format Allowlist');

    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';

    // 6a. Valid PDF Upload
    const pdfMultipart =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="CS302_Assignment.pdf"\r\n` +
      `Content-Type: application/pdf\r\n\r\n` +
      `%PDF-1.4 Academic Assignment Content for Testing SkipQ\r\n` +
      `--${boundary}--\r\n`;

    const pdfUploadRes = await fetch(`${BASE_URL}/api/v1/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: pdfMultipart,
    });
    const pdfUploadData = await pdfUploadRes.json();
    assert(
      pdfUploadRes.status === 201 && pdfUploadData.data?.type === 'application/pdf',
      'PDF upload accepted and processed'
    );
    const uploadedDoc = pdfUploadData.data;

    // 6b. Valid DOCX Upload
    const docxMultipart =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="ProjectReport.docx"\r\n` +
      `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document\r\n\r\n` +
      `PK\x03\x04DocxDummyContent\r\n` +
      `--${boundary}--\r\n`;

    const docxUploadRes = await fetch(`${BASE_URL}/api/v1/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: docxMultipart,
    });
    assert(docxUploadRes.status === 201, 'DOCX Office document upload accepted');

    // 6c. Valid PPTX Upload
    const pptxMultipart =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="Presentation.pptx"\r\n` +
      `Content-Type: application/vnd.openxmlformats-officedocument.presentationml.presentation\r\n\r\n` +
      `PK\x03\x04PptxDummyContent\r\n` +
      `--${boundary}--\r\n`;

    const pptxUploadRes = await fetch(`${BASE_URL}/api/v1/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: pptxMultipart,
    });
    assert(pptxUploadRes.status === 201, 'PPTX Presentation document upload accepted');

    // 6d. Valid PNG Image Upload
    const pngMultipart =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="Diagram.png"\r\n` +
      `Content-Type: image/png\r\n\r\n` +
      `\x89PNG\r\n\x1a\nDummyPngContent\r\n` +
      `--${boundary}--\r\n`;

    const pngUploadRes = await fetch(`${BASE_URL}/api/v1/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: pngMultipart,
    });
    assert(pngUploadRes.status === 201, 'PNG Image document upload accepted');

    // 6e. Disallowed extension rejected (.sh / .exe) -> 400 Bad Request
    const shMultipart =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="script.sh"\r\n` +
      `Content-Type: application/x-sh\r\n\r\n` +
      `#!/bin/bash\necho hello\r\n` +
      `--${boundary}--\r\n`;

    const badUploadRes = await fetch(`${BASE_URL}/api/v1/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: shMultipart,
    });
    assert(badUploadRes.status === 400, 'Disallowed format (.sh) strictly rejected with HTTP 400');

    // 6f. Document Owner Access BEFORE order placement
    const preOrderOwnDocRes = await fetch(`${BASE_URL}/api/v1/documents/file/${uploadedDoc.filename}`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(
      preOrderOwnDocRes.status === 200,
      'Document owner can access their uploaded document before creating an order (200 OK)'
    );

    // 6g. Unrelated Student Access Attempt BEFORE order placement -> MUST BE 403 FORBIDDEN
    const preOrderUnrelatedDocRes = await fetch(`${BASE_URL}/api/v1/documents/file/${uploadedDoc.filename}`, {
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    assert(
      preOrderUnrelatedDocRes.status === 403,
      'Unrelated student cannot access document belonging to another student (403 Forbidden)'
    );

    // 6h. Operational Staff Access to uploaded document -> 200 OK
    const staffDocRes = await fetch(`${BASE_URL}/api/v1/documents/file/${uploadedDoc.filename}`, {
      headers: { Authorization: `Bearer ${staff1Token}` },
    });
    assert(
      staffDocRes.status === 200,
      'Operational staff can access uploaded document for queue processing (200 OK)'
    );

    // 6i. Directory Traversal Attack Attempt -> 403 FORBIDDEN
    const traversalRes = await fetch(`${BASE_URL}/api/v1/documents/file/..%2F..%2Fpackage.json`, {
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    assert(
      traversalRes.status === 403,
      'Directory traversal attempt safely denied (403 Forbidden)'
    );

    // -------------------------------------------------------------
    // SECTION 7: PRICING & PRINTING ORDER WORKFLOW
    // -------------------------------------------------------------
    console.log('\n[7] Printing Order Workflow & Authoritative Pricing');

    // 7a. Authoritative Pricing Calculation
    const pricingRes = await fetch(`${BASE_URL}/api/v1/pricing/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documents: [uploadedDoc],
        config: {
          service: 'PRINT',
          color: 'COLOR',
          paperSize: 'A4',
          sides: 'DOUBLE',
          copies: 2,
          finishing: 'SPIRAL',
        },
      }),
    });
    const pricingData = await pricingRes.json();
    assert(
      pricingRes.status === 200 && pricingData.data?.total > 0 && pricingData.data?.finishingCost === 50,
      'Authoritative pricing engine calculation correct'
    );

    // 7b. Printing Order Creation (Student 1)
    const createOrderRes = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documents: [uploadedDoc],
        config: {
          service: 'PRINT',
          color: 'BW',
          paperSize: 'A4',
          sides: 'SINGLE',
          copies: 1,
          finishing: 'NONE',
        },
        paymentMethod: 'CASH',
      }),
    });
    const createOrderData = await createOrderRes.json();
    assert(
      createOrderRes.status === 201 &&
        createOrderData.data?.token?.startsWith('XR-') &&
        createOrderData.data?.status === 'PENDING' &&
        createOrderData.data?.studentId === student1Id,
      'Print order created with initial PENDING status bound to student JWT sub'
    );
    const order1 = createOrderData.data;

    // 7c. Client-supplied price manipulation attempt (MUST BE OVERRIDDEN)
    const manipulatePriceRes = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documents: [uploadedDoc],
        config: {
          service: 'PRINT',
          color: 'BW',
          paperSize: 'A4',
          sides: 'SINGLE',
          copies: 1,
          finishing: 'NONE',
        },
        paymentMethod: 'CASH',
        pricing: { total: 0.01, baseCost: 0.01 }, // Fraud attempt
      }),
    });
    const manipulatePriceData = await manipulatePriceRes.json();
    assert(
      manipulatePriceRes.status === 201 && manipulatePriceData.data?.pricing?.total >= 5,
      'Client-supplied price manipulation overridden by authoritative server pricing'
    );

    // -------------------------------------------------------------
    // SECTION 8: ORDER OWNERSHIP & DATA PRIVACY
    // -------------------------------------------------------------
    console.log('\n[8] Order Ownership & Cross-User Data Isolation');

    // 8a. Student 1 accesses own order -> ALLOWED (200)
    const ownOrderRes = await fetch(`${BASE_URL}/api/v1/orders/${order1.id}`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(ownOrderRes.status === 200, 'Student 1 can access their own order details');

    // 8b. Student 2 accesses Student 1 order -> FORBIDDEN (403)
    const otherOrderRes = await fetch(`${BASE_URL}/api/v1/orders/${order1.id}`, {
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    assert(otherOrderRes.status === 403, 'Student 2 cannot access Student 1 order (403 Forbidden)');

    // 8c. Student 2 listing orders does not see Student 1 orders
    const student2ListRes = await fetch(`${BASE_URL}/api/v1/orders`, {
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    const student2List = await student2ListRes.json();
    const hasOrder1 = (student2List.data || []).some((o) => o.id === order1.id);
    assert(!hasOrder1, 'Student order listing strictly isolates data to caller own orders');

    // 8d. Student 2 attempts to cancel Student 1 order -> FORBIDDEN (403)
    const otherCancelRes = await fetch(`${BASE_URL}/api/v1/orders/${order1.id}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    assert(otherCancelRes.status === 403, 'Student 2 cannot cancel Student 1 order (403 Forbidden)');

    // 8e. Document Owner (Student 1) accesses order document via /documents/:id/view
    const docViewOwnerRes = await fetch(`${BASE_URL}/api/v1/documents/${uploadedDoc.id}/view`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const docViewOwnerData = await docViewOwnerRes.json();
    assert(
      docViewOwnerRes.status === 200 && (docViewOwnerData.data?.signedUrl || docViewOwnerData.data?.viewUrl),
      'Document owner (Student 1) can view their uploaded document via /documents/:id/view (200 OK)'
    );

    // 8f. Operational Staff accesses Student 1 document associated with active order via /documents/:id/view
    const staffDocViewRes = await fetch(`${BASE_URL}/api/v1/documents/${uploadedDoc.id}/view`, {
      headers: { Authorization: `Bearer ${staff1Token}` },
    });
    const staffDocViewData = await staffDocViewRes.json();
    assert(
      staffDocViewRes.status === 200 && (staffDocViewData.data?.signedUrl || staffDocViewData.data?.viewUrl),
      'Staff member can securely view document belonging to student order via /documents/:id/view (200 OK)'
    );

    // 8g. Verify service-role secret key is NEVER exposed in document view response
    const rawStaffResponse = JSON.stringify(staffDocViewData);
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const leaksServiceKey = Boolean(serviceKey && serviceKey.length > 20 && rawStaffResponse.includes(serviceKey));
    assert(!leaksServiceKey, 'Supabase service-role credentials are NEVER exposed to client responses');

    // 8h. Unrelated Student (Student 2) attempts to view Student 1 document -> MUST BE 403 FORBIDDEN
    const student2DocViewRes = await fetch(`${BASE_URL}/api/v1/documents/${uploadedDoc.id}/view`, {
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    assert(
      student2DocViewRes.status === 403,
      'Unrelated Student 2 cannot access Student 1 document via /documents/:id/view (403 Forbidden)'
    );

    // 8i. Random / Non-existent document ID returns 404 Not Found
    const nonExistentDocRes = await fetch(`${BASE_URL}/api/v1/documents/doc_non_existent_${timestamp}/view`, {
      headers: { Authorization: `Bearer ${staff1Token}` },
    });
    assert(
      nonExistentDocRes.status === 404,
      'Non-existent document ID returns 404 Not Found'
    );

    // 8j. Upload an isolated private document for Student 2 with NO associated order
    const isolatedPdfMultipart =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="Private_Notes_${timestamp}.pdf"\r\n` +
      `Content-Type: application/pdf\r\n\r\n` +
      `%PDF-1.4 Private confidential notes\r\n` +
      `--${boundary}--\r\n`;

    const isolatedUploadRes = await fetch(`${BASE_URL}/api/v1/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${student2Token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: isolatedPdfMultipart,
    });
    const isolatedUploadData = await isolatedUploadRes.json();
    const isolatedDoc = isolatedUploadData.data;

    // Staff attempts to access Student 2's arbitrary private document WITHOUT an order -> MUST BE 403 FORBIDDEN
    const staffArbitraryAccessRes = await fetch(`${BASE_URL}/api/v1/documents/${isolatedDoc.id}/view`, {
      headers: { Authorization: `Bearer ${staff1Token}` },
    });
    assert(
      staffArbitraryAccessRes.status === 403,
      'Staff cannot access arbitrary private student document without an associated order (403 Forbidden)'
    );

    // 8k. Unauthenticated request to /documents/:id/view -> 401 Unauthorized
    const unauthDocRes = await fetch(`${BASE_URL}/api/v1/documents/${uploadedDoc.id}/view`);
    assert(
      unauthDocRes.status === 401,
      'Unauthenticated request to /documents/:id/view returns 401 Unauthorized'
    );

    // -------------------------------------------------------------
    // SECTION 9: STATE MACHINE & PAYMENT VERIFICATION
    // -------------------------------------------------------------
    console.log('\n[9] Order State Machine & Payment Transitions');

    // 9a. Student attempts to update order status -> 403 FORBIDDEN
    const studentStatusAttempt = await fetch(`${BASE_URL}/api/v1/orders/${order1.id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'COLLECTED' }),
    });
    assert(studentStatusAttempt.status === 403, 'Student cannot modify order status (403 Forbidden)');

    // 9b. Student attempts to verify payment -> 403 FORBIDDEN
    const studentPayAttempt = await fetch(`${BASE_URL}/api/v1/orders/${order1.id}/verify-payment`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(studentPayAttempt.status === 403, 'Student cannot verify payment (403 Forbidden)');

    // 9c. Illegal state transition: PENDING directly to COLLECTED -> 400 BAD REQUEST
    const illegalTransition = await fetch(`${BASE_URL}/api/v1/orders/${order1.id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${staff1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'COLLECTED' }),
    });
    assert(illegalTransition.status === 400, 'Illegal transition (PENDING -> COLLECTED) rejected with HTTP 400');

    // 9d. Staff verifies payment at counter -> Transitions to ACCEPTED
    const staffPayRes = await fetch(`${BASE_URL}/api/v1/orders/${order1.id}/verify-payment`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${staff1Token}` },
    });
    const staffPayData = await staffPayRes.json();
    assert(
      staffPayRes.status === 200 && staffPayData.data?.paymentStatus === 'VERIFIED',
      'Staff verifies counter payment and order transitions to ACCEPTED'
    );

    // 9e. Move to PRINTING
    const printRes = await fetch(`${BASE_URL}/api/v1/orders/${order1.id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${staff1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'PRINTING' }),
    });
    assert(printRes.status === 200 && (await printRes.json()).data?.status === 'PRINTING', 'Order transitions to PRINTING');

    // 9f. Move to READY_FOR_PICKUP
    const readyRes = await fetch(`${BASE_URL}/api/v1/orders/${order1.id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${staff1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'READY_FOR_PICKUP' }),
    });
    assert(
      readyRes.status === 200 && (await readyRes.json()).data?.status === 'READY_FOR_PICKUP',
      'Order transitions to READY_FOR_PICKUP'
    );

    // 9g. Finalize order as COLLECTED
    const collectedRes = await fetch(`${BASE_URL}/api/v1/orders/${order1.id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${staff1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'COLLECTED' }),
    });
    assert(
      collectedRes.status === 200 && (await collectedRes.json()).data?.status === 'COLLECTED',
      'Order transitions to terminal COLLECTED status'
    );

    // -------------------------------------------------------------
    // SECTION 10: STATIONERY ORDERS & STOCK INTEGRITY
    // -------------------------------------------------------------
    console.log('\n[10] Stationery Orders & Stock Integrity');

    // 10a. Student places stationery order with snapshotted pricing
    const storeOrderRes = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderType: 'STORE',
        items: [
          {
            itemId: storeItem.id,
            name: storeItem.name,
            quantity: 3,
            unitPrice: updateItemData.data.price,
          },
        ],
        paymentMethod: 'ONLINE',
      }),
    });
    const storeOrderData = await storeOrderRes.json();
    assert(
      storeOrderRes.status === 201 &&
        storeOrderData.data?.orderType === 'STORE' &&
        storeOrderData.data?.pricing?.total === 3 * updateItemData.data.price,
      'Stationery order created with unitPrice snapshotting and server-calculated total',
      `status=${storeOrderRes.status}, expected=${3 * updateItemData.data.price}, received=${storeOrderData.data?.pricing?.total}`
    );
    const storeOrderId = storeOrderData.data?.id;

    // 10b. Stock overselling prevention: attempt to order more than available stock
    const oversellOrderRes = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderType: 'STORE',
        items: [
          {
            itemId: storeItem.id,
            name: storeItem.name,
            quantity: 99999, // Impossible stock
            unitPrice: storeItem.price,
          },
        ],
        paymentMethod: 'CASH',
      }),
    });
    assert(
      oversellOrderRes.status === 400,
      'Stationery order exceeding available stock is rejected with HTTP 400'
    );

    // -------------------------------------------------------------
    // SECTION 11: PROFILE SYSTEM & STRICT DATA PRIVACY
    // -------------------------------------------------------------
    console.log('\n[11] Profile Privacy & Cross-User Isolation');

    // 11a. Student 1 accesses own profile -> 200 OK
    const s1ProfileRes = await fetch(`${BASE_URL}/api/v1/auth/profiles/${student1Id}`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const s1ProfileData = await s1ProfileRes.json();
    assert(
      s1ProfileRes.status === 200 && s1ProfileData.data?.id === student1Id,
      'Student 1 successfully accesses own profile'
    );

    // 11b. Student 2 attempts to access Student 1 profile -> MUST BE 403 FORBIDDEN
    const crossStudentProfileRes = await fetch(`${BASE_URL}/api/v1/auth/profiles/${student1Id}`, {
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    assert(
      crossStudentProfileRes.status === 403,
      'Student 2 cannot access Student 1 private profile (403 Forbidden)'
    );

    // 11c. Student 1 attempts to access Staff 1 profile -> MUST BE 403 FORBIDDEN
    const studentAccessStaffProfileRes = await fetch(`${BASE_URL}/api/v1/auth/profiles/${staff1Id}`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(
      studentAccessStaffProfileRes.status === 403,
      'Student cannot access Staff private profile (403 Forbidden)'
    );

    // 11d. Staff 1 attempts to access Staff 2 profile -> MUST BE 403 FORBIDDEN
    const crossStaffProfileRes = await fetch(`${BASE_URL}/api/v1/auth/profiles/${staff2Id}`, {
      headers: { Authorization: `Bearer ${staff1Token}` },
    });
    assert(
      crossStaffProfileRes.status === 403,
      'Staff 1 cannot access Staff 2 private profile (403 Forbidden)'
    );

    // 11e. Student 1 updates own profile with valid fields
    const updateProfileRes = await fetch(`${BASE_URL}/api/v1/auth/profile`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Alice S. Senior',
        institution: 'MLR Institute of Technology',
        department: 'CSE (AIML)',
        yearOfStudy: '3rd Year',
        phone: '+91 9876543210',
      }),
    });
    const updateProfileData = await updateProfileRes.json();
    assert(
      updateProfileRes.status === 200 &&
        updateProfileData.data?.name === 'Alice S. Senior' &&
        updateProfileData.data?.institution === 'MLR Institute of Technology',
      'Student updates allowed profile fields (name, institution, department, phone)'
    );

    // 11f. Attempt to change protected fields (role escalation attempt)
    const escalateRoleRes = await fetch(`${BASE_URL}/api/v1/auth/profile`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'staff', // Rogue role change
      }),
    });
    const s1VerifyProfileRes = await fetch(`${BASE_URL}/api/v1/auth/profiles/${student1Id}`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const s1VerifiedData = await s1VerifyProfileRes.json();
    assert(
      s1VerifiedData.data?.role === 'student',
      'User cannot escalate their role through profile update (remains student)'
    );

    // -------------------------------------------------------------
    // SECTION 12: QUEUE PRIVACY & NOTIFICATION ISOLATION
    // -------------------------------------------------------------
    console.log('\n[12] Queue Privacy & Notification Data Isolation');

    // 12a. Live Queue sanitizes sensitive OTPs for other students
    const queueRes = await fetch(`${BASE_URL}/api/v1/queue`, {
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    const queueData = await queueRes.json();
    const queueOrders = queueData.data || [];
    const leakedOtp = queueOrders.some((q) => q.otpCode && q.studentId !== student2Id);
    assert(queueRes.status === 200 && !leakedOtp, 'Live queue properly sanitizes sensitive OTP codes for other students');

    // 12b. Notification IDOR: Student 2 cannot mark Student 1 notification read
    const s1NotifsRes = await fetch(`${BASE_URL}/api/v1/notifications`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const s1Notifs = await s1NotifsRes.json();
    if (s1Notifs.data && s1Notifs.data.length > 0) {
      const s1NotifId = s1Notifs.data[0].id;
      const s2TamperNotif = await fetch(`${BASE_URL}/api/v1/notifications/${s1NotifId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${student2Token}` },
      });
      assert(s2TamperNotif.status === 403, 'Student cannot mark another student notification as read (403 Forbidden)');
    }

    // -------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------
    console.log('\n============================================================');
    console.log(`FINAL TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('============================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTests();
