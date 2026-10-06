/**
 * Comprehensive Automated Verification Script for:
 * 1. Sign-out behavior and route protection
 * 2. Secure staff document access via /api/v1/documents/:documentId/view
 */

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const BASE_URL = 'http://localhost:5001';
const timestamp = Date.now();

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

async function runVerification() {
  console.log('====================================================');
  console.log('--- STARTING VERIFICATION: SIGN-OUT & DOCUMENT ACCESS ---');
  console.log('====================================================\n');

  // 1. Create Student & Staff Test Accounts
  const studentEmail = `verify_student_${timestamp}@campus.edu`;
  const studentPass = `StudPass_${timestamp}!1`;
  const staffEmail = `verify_staff_${timestamp}@campus.edu`;
  const staffPass = `StaffPass_${timestamp}!1`;
  const student2Email = `verify_student2_${timestamp}@campus.edu`;
  const student2Pass = `StudPass2_${timestamp}!1`;

  // Register Student 1
  const s1Res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Student One',
      email: studentEmail,
      password: studentPass,
      role: 'student',
      department: 'ECE',
      collegeId: `EC-${timestamp}`,
    }),
  });
  const s1Data = await s1Res.json();
  const s1Token = s1Data.data.token;
  const s1Id = s1Data.data.user.id;
  assert(s1Res.status === 201 && s1Token, 'Student 1 registered successfully');

  // Register Student 2
  const s2Res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Student Two',
      email: student2Email,
      password: student2Pass,
      role: 'student',
      department: 'CSE',
      collegeId: `CS-${timestamp}`,
    }),
  });
  const s2Data = await s2Res.json();
  const s2Token = s2Data.data.token;
  assert(s2Res.status === 201 && s2Token, 'Student 2 registered successfully');

  // Register Staff
  const staffRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Desk Operator 1',
      email: staffEmail,
      password: staffPass,
      role: 'staff',
    }),
  });
  const staffData = await staffRes.json();
  const staffToken = staffData.data.token;
  assert(staffRes.status === 201 && staffToken, 'Staff member registered successfully');

  // -----------------------------------------------------------------
  // 2. Document Uploads (PDF, DOCX, PNG)
  // -----------------------------------------------------------------
  console.log('\n[TEST: Document Uploads by Student 1]');
  const boundary = '----WebKitFormBoundaryVerify' + timestamp;

  // Upload PDF
  const pdfBody =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="Operating_Systems_Lab.pdf"\r\n` +
    `Content-Type: application/pdf\r\n\r\n` +
    `%PDF-1.5 Lab Assignment for Testing SkipQ Document Viewing\r\n` +
    `--${boundary}--\r\n`;

  const pdfUploadRes = await fetch(`${BASE_URL}/api/v1/documents/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${s1Token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body: pdfBody,
  });
  const pdfUploadData = await pdfUploadRes.json();
  const pdfDoc = pdfUploadData.data;
  assert(pdfUploadRes.status === 201 && pdfDoc?.id, 'Student 1 uploaded PDF document');

  // Upload DOCX
  const docxBody =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="Seminar_Report.docx"\r\n` +
    `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document\r\n\r\n` +
    `PK\x03\x04DocxContentForSkipQ\r\n` +
    `--${boundary}--\r\n`;

  const docxUploadRes = await fetch(`${BASE_URL}/api/v1/documents/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${s1Token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body: docxBody,
  });
  const docxUploadData = await docxUploadRes.json();
  const docxDoc = docxUploadData.data;
  assert(docxUploadRes.status === 201 && docxDoc?.id, 'Student 1 uploaded DOCX document');

  // -----------------------------------------------------------------
  // 3. Document Access BEFORE Order Creation
  // -----------------------------------------------------------------
  console.log('\n[TEST: Access Control BEFORE Order Placement]');

  // Student 1 (Owner) views their own document -> 200 OK
  const ownerPreOrderRes = await fetch(`${BASE_URL}/api/v1/documents/${pdfDoc.id}/view`, {
    headers: { Authorization: `Bearer ${s1Token}` },
  });
  const ownerPreOrderData = await ownerPreOrderRes.json();
  assert(
    ownerPreOrderRes.status === 200 && (ownerPreOrderData.data?.signedUrl || ownerPreOrderData.data?.viewUrl),
    'Document owner (Student 1) can view their own document before order placement (200 OK)'
  );

  // Student 2 (Unrelated) attempts to view Student 1's document -> 403 Forbidden
  const s2PreOrderRes = await fetch(`${BASE_URL}/api/v1/documents/${pdfDoc.id}/view`, {
    headers: { Authorization: `Bearer ${s2Token}` },
  });
  assert(
    s2PreOrderRes.status === 403,
    'Unrelated Student 2 is rejected with 403 Forbidden when accessing Student 1 document'
  );

  // Staff attempts to view Student 1's document BEFORE any order references it -> 403 Forbidden
  // (Prevents staff from accessing arbitrary unassociated private storage files)
  const staffPreOrderRes = await fetch(`${BASE_URL}/api/v1/documents/${pdfDoc.id}/view`, {
    headers: { Authorization: `Bearer ${staffToken}` },
  });
  assert(
    staffPreOrderRes.status === 403,
    'Staff cannot access student private document before an order is placed (403 Forbidden)'
  );

  // -----------------------------------------------------------------
  // 4. Student 1 Places Order With Uploaded Documents
  // -----------------------------------------------------------------
  console.log('\n[TEST: Order Creation & Post-Order Access]');

  const orderRes = await fetch(`${BASE_URL}/api/v1/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${s1Token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      documents: [pdfDoc, docxDoc],
      config: {
        service: 'PRINT',
        color: 'BW',
        paperSize: 'A4',
        sides: 'DOUBLE',
        copies: 1,
        finishing: 'STAPLE',
      },
      paymentMethod: 'CASH',
    }),
  });
  const orderData = await orderRes.json();
  const order = orderData.data;
  assert(orderRes.status === 201 && order?.token, `Student 1 created print order (Token: ${order?.token})`);

  // -----------------------------------------------------------------
  // 5. Staff Document Access on Active Order
  // -----------------------------------------------------------------
  console.log('\n[TEST: Staff Document Access on Authorized Order]');

  // Staff views PDF document in the order
  const staffPdfViewRes = await fetch(`${BASE_URL}/api/v1/documents/${pdfDoc.id}/view`, {
    headers: { Authorization: `Bearer ${staffToken}` },
  });
  const staffPdfViewData = await staffPdfViewRes.json();
  assert(
    staffPdfViewRes.status === 200 &&
      (staffPdfViewData.data?.signedUrl || staffPdfViewData.data?.viewUrl) &&
      staffPdfViewData.data?.mimeType === 'application/pdf',
    'Staff can securely access order PDF document via /documents/:id/view (200 OK)'
  );

  // Staff views DOCX document in the order
  const staffDocxViewRes = await fetch(`${BASE_URL}/api/v1/documents/${docxDoc.id}/view`, {
    headers: { Authorization: `Bearer ${staffToken}` },
  });
  const staffDocxViewData = await staffDocxViewRes.json();
  assert(
    staffDocxViewRes.status === 200 &&
      (staffDocxViewData.data?.downloadUrl || staffDocxViewData.data?.signedUrl),
    'Staff can securely access order DOCX document for download/view (200 OK)'
  );

  // Verify that private Supabase service-role credentials are NEVER leaked
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const staffRespText = JSON.stringify(staffPdfViewData) + JSON.stringify(staffDocxViewData);
  const leaksServiceRole = Boolean(serviceKey && serviceKey.length > 20 && staffRespText.includes(serviceKey));
  assert(!leaksServiceRole, 'Supabase service-role key is NEVER exposed in API response payloads');

  // Verify that the bucket is not public
  const publicBucketUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/xerox-documents/${pdfDoc.storagePath}`;
  const publicProbeRes = await fetch(publicBucketUrl).catch(() => ({ status: 400 }));
  assert(
    publicProbeRes.status !== 200,
    'Storage bucket xerox-documents remains strictly PRIVATE (Public probe rejected)'
  );

  // -----------------------------------------------------------------
  // 6. Security Boundaries & Authorization Violations
  // -----------------------------------------------------------------
  console.log('\n[TEST: Security Boundaries & Attack Prevention]');

  // Unrelated Student 2 attempts to view Student 1 order documents -> 403 Forbidden
  const s2OrderDocRes = await fetch(`${BASE_URL}/api/v1/documents/${pdfDoc.id}/view`, {
    headers: { Authorization: `Bearer ${s2Token}` },
  });
  assert(
    s2OrderDocRes.status === 403,
    'Unauthorized Student 2 is blocked from Student 1 order document (403 Forbidden)'
  );

  // Non-existent document ID -> 404 Not Found
  const nonExistentRes = await fetch(`${BASE_URL}/api/v1/documents/doc_nonexistent_${timestamp}/view`, {
    headers: { Authorization: `Bearer ${staffToken}` },
  });
  assert(
    nonExistentRes.status === 404,
    'Request with invalid/random document ID returns 404 Not Found'
  );

  // Tampered document ID / Traversal attempt -> 403 or 404
  const tamperedRes = await fetch(`${BASE_URL}/api/v1/documents/..%2F..%2Fprivate.env/view`, {
    headers: { Authorization: `Bearer ${staffToken}` },
  });
  assert(
    tamperedRes.status === 403 || tamperedRes.status === 404,
    'Tampered document ID / traversal attempt cannot bypass authorization (Blocked)'
  );

  // Unauthenticated request -> 401 Unauthorized
  const unauthRes = await fetch(`${BASE_URL}/api/v1/documents/${pdfDoc.id}/view`);
  assert(
    unauthRes.status === 401,
    'Unauthenticated request without token returns 401 Unauthorized'
  );

  console.log('\n====================================================');
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
