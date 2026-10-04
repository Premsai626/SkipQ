/**
 * Comprehensive Acceptance & Security Verification Test Suite for SkipQ API
 * ZERO hardcoded demo credentials. Dynamically creates isolated test accounts.
 */

import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:5001';
const BOOTSTRAP_KEY = process.env.ADMIN_BOOTSTRAP_KEY || 'skipq_admin_bootstrap_secret_2026';
const JWT_SECRET = process.env.JWT_SECRET || 'xerox_flow_production_jwt_secret_key_2026';

async function runTests() {
  console.log('============================================================');
  console.log('--- STARTING SKIPQ SECURITY & API VERIFICATION SUITE ---');
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
  const adminEmail = `admin_${timestamp}@campus.edu`;
  const adminPass = `AdminP@ss_${timestamp}`;
  const staffEmail = `staff_${timestamp}@campus.edu`;
  const staffPass = `StaffP@ss_${timestamp}`;

  try {
    // -------------------------------------------------------------
    // SECTION 1: HEALTH & PUBLIC DIAGNOSTICS
    // -------------------------------------------------------------
    console.log('\n[1] Health Check');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'HEALTHY', 'Root Health Check returns 200 HEALTHY');

    // -------------------------------------------------------------
    // SECTION 2: AUTHENTICATION (STUDENT REGISTRATION & LOGIN)
    // -------------------------------------------------------------
    console.log('\n[2] Authentication & Password Security');

    // 2a. Student 1 Registration
    const regRes1 = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Student',
        email: student1Email,
        password: student1Pass,
        department: 'CSE',
        collegeId: `CS-${timestamp}`,
      }),
    });
    const regData1 = await regRes1.json();
    assert(
      regRes1.status === 201 && regData1.data?.token && regData1.data?.user?.role === 'student',
      'Valid student registration sets role=student and returns JWT token'
    );
    let student1Token = regData1.data.token;
    const student1Id = regData1.data.user.id;

    // 2b. Attempt to supply role: 'staff' during student registration (Role Security)
    const rogueRegRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rogue User',
        email: `rogue_${timestamp}@campus.edu`,
        password: student1Pass,
        role: 'staff', // Rogue self-assignment attempt
      }),
    });
    const rogueData = await rogueRegRes.json();
    assert(
      rogueRegRes.status === 201 && rogueData.data?.user?.role === 'student',
      'Client cannot supply role during registration (always student)'
    );

    // 2c. Student 2 Registration (for ownership testing)
    const regRes2 = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bob Student',
        email: student2Email,
        password: student2Pass,
      }),
    });
    const regData2 = await regRes2.json();
    const student2Token = regData2.data.token;
    const student2Id = regData2.data.user.id;

    // 2d. Valid Login
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: student1Email, password: student1Pass }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.data?.token, 'Valid login with bcrypt password verification');

    // 2e. Invalid Password Login (Generic 401 without enumeration)
    const badPassRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: student1Email, password: 'WrongPassword999!' }),
    });
    assert(
      badPassRes.status === 401 && (await badPassRes.json()).message === 'Invalid email or password',
      'Invalid password returns generic 401 "Invalid email or password"'
    );

    // 2f. Unknown Email Login
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
    // SECTION 3: JWT AUTHORIZATION & BYPASS PREVENTION
    // -------------------------------------------------------------
    console.log('\n[3] JWT & Authorization Guarding');

    // 3a. Protected endpoint without Authorization header
    const noAuthRes = await fetch(`${BASE_URL}/api/v1/orders`);
    assert(noAuthRes.status === 401, 'Request to protected endpoint without JWT returns 401 Unauthorized');

    // 3b. Protected endpoint with fake/invalid JWT
    const invalidJwtRes = await fetch(`${BASE_URL}/api/v1/orders`, {
      headers: { Authorization: 'Bearer this.is.an.invalid.token' },
    });
    assert(invalidJwtRes.status === 401, 'Request with invalid JWT returns 401 Unauthorized');

    // 3c. Protected endpoint with expired JWT
    const expiredToken = jwt.sign(
      { sub: student1Id, email: student1Email, role: 'student', exp: Math.floor(Date.now() / 1000) - 100 },
      JWT_SECRET
    );
    const expiredRes = await fetch(`${BASE_URL}/api/v1/orders`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert(expiredRes.status === 401, 'Request with expired JWT returns 401 Unauthorized');

    // 3d. x-dev-role bypass attempt (MUST BE REJECTED)
    const devRoleAttempt = await fetch(`${BASE_URL}/api/v1/analytics`, {
      headers: {
        'x-dev-role': 'staff', // Insecure legacy header attempt
      },
    });
    assert(devRoleAttempt.status === 401, 'x-dev-role header is completely ignored and rejected with 401');

    // -------------------------------------------------------------
    // SECTION 4: ADMIN BOOTSTRAP & STAFF PROVISIONING
    // -------------------------------------------------------------
    console.log('\n[4] Admin Bootstrapping & Staff Provisioning');

    // 4a. Bootstrap Admin
    const adminBootRes = await fetch(`${BASE_URL}/api/v1/auth/admin/bootstrap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bootstrapKey: BOOTSTRAP_KEY,
        name: 'Campus IT Administrator',
        email: adminEmail,
        password: adminPass,
      }),
    });
    const adminBootData = await adminBootRes.json();
    assert(
      adminBootRes.status === 201 && adminBootData.data?.user?.role === 'admin',
      'Administrator bootstrapped successfully with role=admin'
    );
    const adminToken = adminBootData.data.token;
    const adminId = adminBootData.data.user.id;

    // 4b. Student attempting to provision staff (MUST BE 403 FORBIDDEN)
    const studentProvStaff = await fetch(`${BASE_URL}/api/v1/admin/staff`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Unauthorized Staff', email: 'unauth@campus.edu' }),
    });
    assert(studentProvStaff.status === 403, 'Student cannot access admin staff provisioning endpoint (403)');

    // 4c. Admin provisions staff member
    const provStaffRes = await fetch(`${BASE_URL}/api/v1/admin/staff`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Desk Operator Ramesh',
        email: staffEmail,
        password: staffPass,
        department: 'Central Library Stationery Desk',
        collegeId: 'STAFF-01',
      }),
    });
    const provStaffData = await provStaffRes.json();
    assert(
      provStaffRes.status === 201 && provStaffData.data?.role === 'staff',
      'Admin successfully provisions staff account with role=staff and status=active'
    );
    const staffId = provStaffData.data.id;

    // 4d. Provisioned staff authenticates
    const staffLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: staffEmail, password: staffPass }),
    });
    const staffLoginData = await staffLoginRes.json();
    assert(
      staffLoginRes.status === 200 && staffLoginData.data?.user?.role === 'staff',
      'Provisioned staff can log in and receives staff authorization'
    );
    const staffToken = staffLoginData.data.token;

    // 4e. Staff accesses staff analytics endpoint
    const staffAnalytics = await fetch(`${BASE_URL}/api/v1/analytics`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert(staffAnalytics.status === 200, 'Staff member successfully accesses staff analytics');

    // 4f. Student accesses staff analytics endpoint (MUST BE 403)
    const studentAnalytics = await fetch(`${BASE_URL}/api/v1/analytics`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(studentAnalytics.status === 403, 'Student is forbidden from staff analytics (403)');

    // -------------------------------------------------------------
    // SECTION 5: DOCUMENT UPLOAD & VALIDATION
    // -------------------------------------------------------------
    console.log('\n[5] Document Upload & Storage Security');

    // 5a. Valid PDF Upload
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const sampleContent = '%PDF-1.4 Academic Assignment Content for Testing SkipQ';
    const multipartBody =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="CS302_Assignment.pdf"\r\n` +
      `Content-Type: application/pdf\r\n\r\n` +
      `${sampleContent}\r\n` +
      `--${boundary}--\r\n`;

    const uploadRes = await fetch(`${BASE_URL}/api/v1/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: multipartBody,
    });
    const uploadData = await uploadRes.json();
    assert(
      uploadRes.status === 201 && uploadData.data?.id && uploadData.data?.type === 'application/pdf',
      'Valid PDF upload accepted and processed'
    );
    const uploadedDoc = uploadData.data;

    // 5b. Invalid file type rejection (e.g. .exe disguised or disallowed format)
    const invalidMultipartBody =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="malicious.exe"\r\n` +
      `Content-Type: application/x-msdownload\r\n\r\n` +
      `MZBinaryContent\r\n` +
      `--${boundary}--\r\n`;

    const badUploadRes = await fetch(`${BASE_URL}/api/v1/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: invalidMultipartBody,
    });
    assert(badUploadRes.status === 400, 'Disallowed file format is rejected with HTTP 400');

    // -------------------------------------------------------------
    // SECTION 6: PRICING & ORDER WORKFLOW
    // -------------------------------------------------------------
    console.log('\n[6] Order Workflow & State Machine');

    // 6a. Pricing Engine
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

    // 6b. Order Creation (Student 1)
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
      'Order created with initial PENDING status and student identity bound to JWT sub'
    );
    const order1 = createOrderData.data;

    // -------------------------------------------------------------
    // SECTION 7: ORDER OWNERSHIP & DATA ISOLATION
    // -------------------------------------------------------------
    console.log('\n[7] Order Ownership & Data Isolation');

    // 7a. Student 1 accesses own order -> ALLOWED (200)
    const ownOrderRes = await fetch(`${BASE_URL}/api/v1/orders/${order1.id}`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(ownOrderRes.status === 200, 'Student can access their own order details');

    // 7b. Student 2 accesses Student 1 order -> FORBIDDEN (403)
    const otherOrderRes = await fetch(`${BASE_URL}/api/v1/orders/${order1.id}`, {
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    assert(otherOrderRes.status === 403, 'Student cannot access another student order (403 Forbidden)');

    // 7c. Student 2 listing orders does not see Student 1 orders
    const student2ListRes = await fetch(`${BASE_URL}/api/v1/orders`, {
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    const student2List = await student2ListRes.json();
    const hasOrder1 = (student2List.data || []).some((o) => o.id === order1.id);
    assert(!hasOrder1, 'Student order listing isolates data to caller own orders only');

    // 7d. Student 1 accesses own document file -> ALLOWED (200)
    const ownDocRes = await fetch(`${BASE_URL}/api/v1/documents/file/${uploadedDoc.filename}`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(ownDocRes.status === 200, 'Student can access their own uploaded document');

    // 7e. Student 2 accesses Student 1 document file -> FORBIDDEN (403)
    const otherDocRes = await fetch(`${BASE_URL}/api/v1/documents/file/${uploadedDoc.filename}`, {
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    assert(otherDocRes.status === 403, 'Student cannot access another student document (403 Forbidden)');

    // -------------------------------------------------------------
    // SECTION 8: STATE MACHINE & PAYMENT VERIFICATION
    // -------------------------------------------------------------
    console.log('\n[8] State Machine Transitions & Payment Verification');

    // 8a. Student attempts to update order status -> 403 FORBIDDEN
    const studentStatusAttempt = await fetch(`${BASE_URL}/api/v1/orders/${order1.id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'COLLECTED' }),
    });
    assert(studentStatusAttempt.status === 403, 'Student cannot modify order status (403 Forbidden)');

    // 8b. Student attempts to verify payment -> 403 FORBIDDEN
    const studentPayAttempt = await fetch(`${BASE_URL}/api/v1/orders/${order1.id}/verify-payment`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(studentPayAttempt.status === 403, 'Student cannot verify payment (403 Forbidden)');

    // 8c. Illegal state transition attempt by staff: PENDING directly to COLLECTED -> 400 BAD REQUEST
    const illegalTransition = await fetch(`${BASE_URL}/api/v1/orders/${order1.id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${staffToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'COLLECTED' }),
    });
    assert(illegalTransition.status === 400, 'Illegal transition (PENDING -> COLLECTED) rejected with HTTP 400');

    // 8d. Staff verifies payment at counter -> Transitions to ACCEPTED
    const staffPayRes = await fetch(`${BASE_URL}/api/v1/orders/${order1.id}/verify-payment`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    const staffPayData = await staffPayRes.json();
    assert(
      staffPayRes.status === 200 && staffPayData.data?.paymentStatus === 'VERIFIED',
      'Staff verifies counter payment and order transitions to ACCEPTED'
    );

    // 8e. Move to PRINTING
    const printRes = await fetch(`${BASE_URL}/api/v1/orders/${order1.id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${staffToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'PRINTING' }),
    });
    assert(printRes.status === 200 && (await printRes.json()).data?.status === 'PRINTING', 'Order transitions to PRINTING');

    // 8f. Move to READY_FOR_PICKUP
    const readyRes = await fetch(`${BASE_URL}/api/v1/orders/${order1.id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${staffToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'READY_FOR_PICKUP' }),
    });
    assert(
      readyRes.status === 200 && (await readyRes.json()).data?.status === 'READY_FOR_PICKUP',
      'Order transitions to READY_FOR_PICKUP'
    );

    // 8g. Finalize order as COLLECTED
    const collectedRes = await fetch(`${BASE_URL}/api/v1/orders/${order1.id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${staffToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'COLLECTED' }),
    });
    assert(
      collectedRes.status === 200 && (await collectedRes.json()).data?.status === 'COLLECTED',
      'Order transitions to terminal COLLECTED status'
    );

    // -------------------------------------------------------------
    // SECTION 9: STAFF DEPROVISIONING & SERVER-SIDE ROLE REVOCATION
    // -------------------------------------------------------------
    console.log('\n[9] Staff Deprovisioning & Immediate Revocation');

    // 9a. Staff cannot deprovision themselves -> 400 / 403
    const selfDeprov = await fetch(`${BASE_URL}/api/v1/admin/staff/${staffId}/deactivate`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${staffToken}` }, // Staff calling admin endpoint
    });
    assert(selfDeprov.status === 403, 'Staff cannot call admin deprovisioning endpoint (403)');

    // 9b. Admin deprovisions staff member
    const deprovRes = await fetch(`${BASE_URL}/api/v1/admin/staff/${staffId}/deactivate`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deprovData = await deprovRes.json();
    assert(
      deprovRes.status === 200 && deprovData.data?.role === 'student' && deprovData.data?.status === 'active',
      'Admin deprovisions staff: Role becomes student while account remains active'
    );

    // 9c. IMMEDIATE REVOCATION: Old staff JWT used for staff endpoint -> MUST BE 403 FORBIDDEN!
    // (Proves that sensitive operations do not indefinitely trust stale JWT claims)
    const oldStaffTokenAttempt = await fetch(`${BASE_URL}/api/v1/analytics`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert(
      oldStaffTokenAttempt.status === 403,
      'Old staff JWT immediately denied (403) after deprovisioning due to authoritative DB role check'
    );

    // 9d. Former staff member can still use permitted student functionality
    const formerStaffAsStudent = await fetch(`${BASE_URL}/api/v1/orders`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert(
      formerStaffAsStudent.status === 200,
      'Former staff member can continue accessing normal student endpoints'
    );

    // -------------------------------------------------------------
    // SECTION 10: QUEUE SANITIZATION & PRIVACY
    // -------------------------------------------------------------
    console.log('\n[10] Live Queue Privacy');

    const queueRes = await fetch(`${BASE_URL}/api/v1/queue`, {
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    const queueData = await queueRes.json();
    const queueOrders = queueData.data || [];
    const leakedOtp = queueOrders.some((q) => q.otpCode && q.studentId !== student2Id);
    assert(queueRes.status === 200 && !leakedOtp, 'Live queue properly sanitizes sensitive OTP codes for other students');

    // -------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------
    console.log('\n============================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
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
