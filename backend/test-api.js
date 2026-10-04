/**
 * Full-Stack Acceptance & Verification Test Suite for SkipQ API
 */

const BASE_URL = 'http://localhost:5001';

async function runTests() {
  console.log('--- STARTING FULL-STACK API VERIFICATION ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'HEALTHY', 'Root Health Check');

    // 2. Student Auth
    const studentLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'prem.sai@campus.edu', password: 'password123', role: 'student' }),
    });
    const studentAuth = await studentLoginRes.json();
    assert(studentLoginRes.status === 200 && studentAuth.data.token, 'Student Authentication & JWT issuance');
    const studentToken = studentAuth.data.token;

    // 3. Staff Auth
    const staffLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'desk.library@campus.edu', password: 'password123', role: 'staff' }),
    });
    const staffAuth = await staffLoginRes.json();
    assert(staffLoginRes.status === 200 && staffAuth.data.user.role === 'staff', 'Staff Authentication');
    const staffToken = staffAuth.data.token;

    // 4. Multipart Document Upload
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const sampleContent = '%PDF-1.4 Mock Academic Assignment Content for Testing';
    const multipartBody = 
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="Test_Assignment_CS302.pdf"\r\n` +
      `Content-Type: application/pdf\r\n\r\n` +
      `${sampleContent}\r\n` +
      `--${boundary}--\r\n`;

    const uploadRes = await fetch(`${BASE_URL}/api/v1/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: multipartBody,
    });
    const uploadData = await uploadRes.json();
    assert(uploadRes.status === 201 && uploadData.data.id && uploadData.data.name === 'Test_Assignment_CS302.pdf', 'Real Document Upload & Server File Processing');
    const uploadedDoc = uploadData.data;

    // 5. Authoritative Pricing Calculation
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
    assert(pricingRes.status === 200 && pricingData.data.total > 0 && pricingData.data.finishingCost === 50, 'Authoritative Pricing Engine Calculation');

    // 6. Order Creation
    const createOrderRes = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documents: [uploadedDoc],
        config: {
          service: 'PRINT',
          color: 'BW',
          paperSize: 'A4',
          sides: 'DOUBLE',
          copies: 1,
          finishing: 'STAPLE',
          instructions: 'Top-left staple',
        },
        paymentMethod: 'CASH',
      }),
    });
    const createData = await createOrderRes.json();
    assert(createOrderRes.status === 201 && createData.data.token?.startsWith('XR-') && createData.data.status === 'PENDING', `Order Creation with Human Token (${createData.data.token}) and OTP (${createData.data.otpCode})`);
    const newOrder = createData.data;

    // 7. Retrieve Order by Token
    const getOrderRes = await fetch(`${BASE_URL}/api/v1/orders/${newOrder.token}`, {
      headers: { 'Authorization': `Bearer ${studentToken}` },
    });
    const getOrderData = await getOrderRes.json();
    assert(getOrderRes.status === 200 && getOrderData.data.id === newOrder.id, 'Retrieve Order by Human Token');

    // 8. Staff Verify Cash Payment
    const verifyPayRes = await fetch(`${BASE_URL}/api/v1/orders/${newOrder.id}/verify-payment`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${staffToken}` },
    });
    const verifyPayData = await verifyPayRes.json();
    assert(verifyPayRes.status === 200 && verifyPayData.data.paymentStatus === 'VERIFIED' && verifyPayData.data.status === 'ACCEPTED', 'Staff Counter Cash Verification & Status to ACCEPTED');

    // 9. Staff Advance to PRINTING
    const printingRes = await fetch(`${BASE_URL}/api/v1/orders/${newOrder.id}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${staffToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'PRINTING' }),
    });
    const printingData = await printingRes.json();
    assert(printingRes.status === 200 && printingData.data.status === 'PRINTING', 'Advance Order to PRINTING on Xerox machine');

    // 10. Staff Advance to READY_FOR_PICKUP
    const readyRes = await fetch(`${BASE_URL}/api/v1/orders/${newOrder.id}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${staffToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'READY_FOR_PICKUP' }),
    });
    const readyData = await readyRes.json();
    assert(readyRes.status === 200 && readyData.data.status === 'READY_FOR_PICKUP', 'Mark Order READY_FOR_PICKUP at collection desk');

    // 11. Test Invalid Status Transition Guard
    const invalidRes = await fetch(`${BASE_URL}/api/v1/orders/${newOrder.id}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${staffToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'PENDING' }), // Invalid: cannot go backwards from READY_FOR_PICKUP to PENDING
    });
    assert(invalidRes.status === 400, 'State Machine Transition Guard (Rejects illegal rollback to PENDING)');

    // 12. Staff Mark COLLECTED (Complete Order)
    const collectedRes = await fetch(`${BASE_URL}/api/v1/orders/${newOrder.id}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${staffToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'COLLECTED' }),
    });
    const collectedData = await collectedRes.json();
    assert(collectedRes.status === 200 && collectedData.data.status === 'COLLECTED', 'Finalize Order as COLLECTED');

    // 13. Rejection Test with Reason
    const orderToRejectRes = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documents: [uploadedDoc],
        config: {
          service: 'XEROX',
          color: 'BW',
          paperSize: 'A4',
          sides: 'SINGLE',
          copies: 1,
          finishing: 'NONE',
        },
        paymentMethod: 'CASH',
      }),
    });
    const orderToReject = (await orderToRejectRes.json()).data;

    const rejectRes = await fetch(`${BASE_URL}/api/v1/orders/${orderToReject.id}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${staffToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'REJECTED',
        rejectionReason: 'Illegible handwritten equations',
      }),
    });
    const rejectData = await rejectRes.json();
    assert(rejectRes.status === 200 && rejectData.data.status === 'REJECTED' && rejectData.data.rejectionReason === 'Illegible handwritten equations', 'Rejection Flow with Mandatory Operator Reason');

    // 14. Live Queue Check
    const queueRes = await fetch(`${BASE_URL}/api/v1/queue`, {
      headers: { 'Authorization': `Bearer ${studentToken}` },
    });
    const queueData = await queueRes.json();
    assert(queueRes.status === 200 && Array.isArray(queueData.data), `Live Queue API Returns Active Queue (${queueData.data.length} active jobs)`);

    // 15. Operational Analytics
    const analyticsRes = await fetch(`${BASE_URL}/api/v1/analytics`, {
      headers: { 'Authorization': `Bearer ${staffToken}` },
    });
    const analyticsData = await analyticsRes.json();
    assert(analyticsRes.status === 200 && analyticsData.data.completedTodayCount > 0, `Operational Analytics API (${analyticsData.data.completedTodayCount} completed, ₹${analyticsData.data.todayRevenue} revenue)`);

    console.log(`\n=========================================`);
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`=========================================`);
  } catch (err) {
    console.error('Fatal test error:', err);
  }
}

runTests();
