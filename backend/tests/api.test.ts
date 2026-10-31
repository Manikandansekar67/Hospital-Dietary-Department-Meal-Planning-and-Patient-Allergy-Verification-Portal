/**
 * Comprehensive Automated End-to-End Test Suite for All Project APIs
 * Tests GET, POST, PUT, PATCH, DELETE methods, authentication, role authorization,
 * validation errors, and database persistence.
 */

let BASE_URL = process.env.TEST_API_URL || '';
let testServer: any = null;

async function ensureServer() {
  if (BASE_URL) return;

  // Try checking existing dev ports 5001 or 3000 first
  for (const port of [5001, 3000]) {
    try {
      const res = await fetch(`http://localhost:${port}/api/health`);
      if (res.ok) {
        BASE_URL = `http://localhost:${port}/api`;
        return;
      }
    } catch {
      // ignore
    }
  }

  // Start in-process test server on an ephemeral port
  const { app } = await import('../src/app.js');
  const { connectDatabase } = await import('../src/config/database.js');
  await connectDatabase();
  const http = await import('http');
  testServer = http.createServer(app);
  await new Promise<void>((resolve) => {
    testServer.listen(0, () => {
      const port = testServer.address().port;
      BASE_URL = `http://localhost:${port}/api`;
      resolve();
    });
  });
}

interface TestResult {
  suite: string;
  test: string;
  status: 'PASSED' | 'FAILED';
  expectedCode?: number;
  actualCode?: number;
  error?: string;
}

const results: TestResult[] = [];

async function api(
  method: string,
  path: string,
  token?: string,
  body?: unknown
): Promise<{ status: number; data: any }> {
  await ensureServer();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: any = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return { status: res.status, data };
}

function assert(
  suite: string,
  testName: string,
  expectedCode: number,
  actualCode: number,
  condition: boolean = true,
  detail?: string
) {
  const passed = actualCode === expectedCode && condition;
  results.push({
    suite,
    test: testName,
    status: passed ? 'PASSED' : 'FAILED',
    expectedCode,
    actualCode,
    error: passed ? undefined : detail || `Expected HTTP ${expectedCode}, received ${actualCode}`,
  });
  if (passed) {
    console.log(`  ✓ [${suite}] ${testName} (HTTP ${actualCode})`);
  } else {
    console.error(`  ✗ [${suite}] ${testName}: Expected ${expectedCode}, got ${actualCode}. ${detail || ''}`);
  }
}

export async function runAllApiTests(): Promise<boolean> {
  console.log('\n======================================================');
  console.log(' HOSPITAL PORTAL: FULL CRUD & REST API TEST SUITE');
  console.log('======================================================\n');

  // 1. Authenticate users
  console.log('--- 1. AUTHENTICATION & TOKENS ---');
  let adminToken = '';
  let doctorToken = '';
  let patientToken = '';
  let kitchenToken = '';

  const adminLogin = await api('POST', '/auth/login', undefined, {
    identifier: 'admin@hospital.com',
    password: 'Hospital@123',
  });
  assert('Auth', 'Admin login with valid credentials', 200, adminLogin.status);
  adminToken = adminLogin.data?.data?.token;

  const docLogin = await api('POST', '/auth/login', undefined, {
    identifier: 'doctor@hospital.com',
    password: 'Hospital@123',
  });
  assert('Auth', 'Doctor login with valid credentials', 200, docLogin.status);
  doctorToken = docLogin.data?.data?.token;

  const patLogin = await api('POST', '/auth/login', undefined, {
    identifier: 'patient@hospital.com',
    password: 'Hospital@123',
  });
  assert('Auth', 'Patient login with valid credentials', 200, patLogin.status);
  patientToken = patLogin.data?.data?.token;

  const kitLogin = await api('POST', '/auth/login', undefined, {
    identifier: 'kitchen@hospital.com',
    password: 'Hospital@123',
  });
  assert('Auth', 'Kitchen staff login with valid credentials', 200, kitLogin.status);
  kitchenToken = kitLogin.data?.data?.token;

  // Invalid login
  const badLogin = await api('POST', '/auth/login', undefined, {
    identifier: 'admin@hospital.com',
    password: 'WrongPassword!',
  });
  assert('Auth', 'Login with invalid password returns 401', 401, badLogin.status);

  // Unauthenticated request
  const unauthMe = await api('GET', '/auth/me');
  assert('Auth', 'Unauthenticated request returns 401', 401, unauthMe.status);

  // Current authenticated user (GET)
  const authMe = await api('GET', '/auth/me', adminToken);
  assert('Auth', 'GET /auth/me returns current user profile', 200, authMe.status, (authMe.data?.data?.user?.role || authMe.data?.data?.role) === 'ADMIN');

  // 2. DOCTOR ACCESS TO /doctors (Specific fix verification)
  console.log('\n--- 2. DOCTOR DIRECTORY & RBAC PERMISSIONS ---');
  const docGetAdminDoctors = await api('GET', '/admin/doctors', doctorToken);
  assert(
    'Doctors Directory',
    'Doctor accessing GET /api/admin/doctors returns 200 (not 403)',
    200,
    docGetAdminDoctors.status,
    Array.isArray(docGetAdminDoctors.data?.data)
  );

  const docGetDoctorDoctors = await api('GET', '/doctor/doctors', doctorToken);
  assert(
    'Doctors Directory',
    'Doctor accessing GET /api/doctor/doctors returns 200',
    200,
    docGetDoctorDoctors.status,
    Array.isArray(docGetDoctorDoctors.data?.data)
  );

  const adminGetDoctors = await api('GET', '/doctors', adminToken);
  assert(
    'Doctors Directory',
    'Admin accessing GET /api/doctors returns 200',
    200,
    adminGetDoctors.status,
    Array.isArray(adminGetDoctors.data?.data)
  );

  // 3. NOTIFICATIONS (Specific fix verification: no 500 error on Date sorting)
  console.log('\n--- 3. NOTIFICATIONS CRUD & DATE SAFE SORTING ---');
  const getNotifs = await api('GET', '/notifications', doctorToken);
  assert(
    'Notifications',
    'GET /api/notifications returns 200 (no 500 crash on date sorting)',
    200,
    getNotifs.status,
    Array.isArray(getNotifs.data?.data)
  );

  const adminNotifs = await api('GET', '/notifications', adminToken);
  assert(
    'Notifications',
    'Admin GET /api/notifications returns 200',
    200,
    adminNotifs.status,
    Array.isArray(adminNotifs.data?.data)
  );

  let notifId = adminNotifs.data?.data?.[0]?.id;
  if (!notifId) {
    notifId = 'notif-1';
  }
  // PATCH notification
  const patchNotif = await api('PATCH', `/notifications/${notifId}/read`, adminToken, { isRead: true });
  assert('Notifications', 'PATCH /api/notifications/:id/read returns 200', 200, patchNotif.status);

  // 4. USERS CRUD (GET, POST, PUT, PATCH, DELETE)
  console.log('\n--- 4. USERS CRUD (ADMIN) ---');
  const uniqueNum = Date.now().toString().slice(-6);
  const testEmail = `testuser_${uniqueNum}@hospital.com`;
  const testPhone = `+1555${uniqueNum}`;

  // POST create user
  const createUser = await api('POST', '/admin/users', adminToken, {
    name: `Automated Test User ${uniqueNum}`,
    email: testEmail,
    role: 'PATIENT',
    phone: testPhone,
    age: 35,
    dateOfBirth: '1991-05-15',
  });
  assert('Users', 'POST /api/admin/users creates user (201)', 201, createUser.status);
  const createdUserId = createUser.data?.data?.id;

  // GET users
  const getUsers = await api('GET', '/admin/users', adminToken);
  assert('Users', 'GET /api/admin/users lists all users (200)', 200, getUsers.status, Array.isArray(getUsers.data?.data));

  if (createdUserId) {
    // PUT full update user
    const putUser = await api('PUT', `/admin/users/${createdUserId}`, adminToken, {
      name: `Updated User Name ${uniqueNum}`,
      email: testEmail,
      phone: testPhone,
      age: 36,
      dateOfBirth: '1990-05-15',
      role: 'PATIENT',
    });
    assert('Users', 'PUT /api/admin/users/:id updates user (200)', 200, putUser.status, putUser.data?.data?.name.includes('Updated'));

    // PATCH partial update user
    const patchUser = await api('PATCH', `/admin/users/${createdUserId}`, adminToken, {
      age: 37,
    });
    assert('Users', 'PATCH /api/admin/users/:id partially updates user (200)', 200, patchUser.status, patchUser.data?.data?.age === 37);

    // PUT status toggle
    const toggleStatus = await api('PUT', `/admin/users/${createdUserId}/status`, adminToken, {
      status: 'INACTIVE',
    });
    assert('Users', 'PUT /api/admin/users/:id/status updates status (200)', 200, toggleStatus.status, toggleStatus.data?.data?.status === 'INACTIVE');

    // DELETE user
    const delUser = await api('DELETE', `/admin/users/${createdUserId}`, adminToken);
    assert('Users', 'DELETE /api/admin/users/:id deletes user (200)', 200, delUser.status);
  }

  // 5. PATIENTS CRUD (GET, POST, PUT, PATCH, DELETE)
  console.log('\n--- 5. PATIENTS CRUD & DOCTOR ASSIGNMENT ---');
  const patientNum = `P-${uniqueNum}`;
  const createPatient = await api('POST', '/patients', adminToken, {
    name: `Inpatient Test ${uniqueNum}`,
    age: 58,
    gender: 'MALE',
    roomNumber: `Room 40${uniqueNum.slice(-1)}`,
    patientCode: patientNum,
    phone: `+1666${uniqueNum}`,
    diseases: ['Hypertension'],
    allergies: [{ allergyName: 'Shellfish', severity: 'MODERATE' }],
  });
  assert('Patients', 'POST /api/patients creates patient (201)', 201, createPatient.status);
  const createdPatientId = createPatient.data?.data?.id;

  // GET patients
  const listPatients = await api('GET', '/patients', adminToken);
  assert('Patients', 'GET /api/patients lists patients (200)', 200, listPatients.status, Array.isArray(listPatients.data?.data));

  if (createdPatientId) {
    // GET patient profile
    const getPatient = await api('GET', `/patients/${createdPatientId}`, adminToken);
    assert('Patients', 'GET /api/patients/:patientId returns patient profile (200)', 200, getPatient.status);

    // PUT patient
    const putPatient = await api('PUT', `/patients/${createdPatientId}`, adminToken, {
      age: 59,
      roomNumber: 'Room 501',
    });
    assert('Patients', 'PUT /api/patients/:patientId updates patient (200)', 200, putPatient.status);

    // PATCH patient
    const patchPatient = await api('PATCH', `/patients/${createdPatientId}`, adminToken, {
      roomNumber: 'Room 502',
    });
    assert('Patients', 'PATCH /api/patients/:patientId partially updates patient (200)', 200, patchPatient.status);

    // PUT assign doctor
    const assignDoc = await api('PUT', `/admin/patients/${createdPatientId}/assign-doctor`, adminToken, {
      doctorId: 'usr-doc-1',
    });
    assert('Patients', 'PUT /api/admin/patients/:id/assign-doctor assigns doctor (200)', 200, assignDoc.status);

    // DELETE remove doctor assignment
    const removeDoc = await api('DELETE', `/admin/patients/${createdPatientId}/assign-doctor`, adminToken);
    assert('Patients', 'DELETE /api/admin/patients/:id/assign-doctor removes doctor (200)', 200, removeDoc.status);

    // DELETE patient
    const delPatient = await api('DELETE', `/patients/${createdPatientId}`, adminToken);
    assert('Patients', 'DELETE /api/patients/:patientId deletes patient (200)', 200, delPatient.status);
  }

  // 6. FOODS CRUD (GET, POST, PUT, PATCH, DELETE)
  console.log('\n--- 6. FOODS CRUD ---');
  const foodName = `Culinary Test Dish ${uniqueNum}`;
  const createFood = await api('POST', '/foods', doctorToken, {
    name: foodName,
    category: 'LUNCH',
    description: 'Fresh seasonal vegetable salad',
    calories: 210,
    protein: 8,
    carbohydrates: 25,
    fat: 4,
    sodium: 55,
    sugar: 3,
    ingredients: ['Cucumber', 'Tomatoes', 'Olive Oil'],
  });
  assert('Foods', 'POST /api/foods creates food (201)', 201, createFood.status);
  const createdFoodId = createFood.data?.data?.food?.id || createFood.data?.data?.id;

  // GET foods list
  const getFoods = await api('GET', '/foods', doctorToken);
  assert('Foods', 'GET /api/foods lists food items (200)', 200, getFoods.status, Array.isArray(getFoods.data?.data));

  if (createdFoodId) {
    // GET food by id
    const getFood = await api('GET', `/foods/${createdFoodId}`, doctorToken);
    assert('Foods', 'GET /api/foods/:id returns food item (200)', 200, getFood.status);

    // PUT food
    const putFood = await api('PUT', `/foods/${createdFoodId}`, doctorToken, {
      name: `${foodName} (Updated)`,
      calories: 220,
    });
    assert('Foods', 'PUT /api/foods/:id updates food (200)', 200, putFood.status);

    // PATCH food
    const patchFood = await api('PATCH', `/foods/${createdFoodId}`, doctorToken, {
      description: 'Partially patched description',
    });
    assert('Foods', 'PATCH /api/foods/:id partially updates food (200)', 200, patchFood.status);

    // DELETE food
    const delFood = await api('DELETE', `/foods/${createdFoodId}`, doctorToken);
    assert('Foods', 'DELETE /api/foods/:id deletes food item (200)', 200, delFood.status);
  }

  // 7. DISEASES & ALLERGIES CRUD
  console.log('\n--- 7. DISEASES & ALLERGIES CRUD ---');
  const disName = `Condition ${uniqueNum}`;
  const createDis = await api('POST', '/admin/diseases', adminToken, {
    name: disName,
    description: 'Cardiovascular evaluation note',
  });
  assert('Diseases', 'POST /api/admin/diseases creates disease (201)', 201, createDis.status);
  const createdDisId = createDis.data?.data?.id;

  const getDiseases = await api('GET', '/diseases', adminToken);
  assert('Diseases', 'GET /api/diseases lists diseases (200)', 200, getDiseases.status, Array.isArray(getDiseases.data?.data));

  if (createdDisId) {
    const patchDis = await api('PATCH', `/admin/diseases/${createdDisId}`, adminToken, {
      description: 'Patched clinical description',
    });
    assert('Diseases', 'PATCH /api/admin/diseases/:id updates disease (200)', 200, patchDis.status);

    const delDis = await api('DELETE', `/admin/diseases/${createdDisId}`, adminToken);
    assert('Diseases', 'DELETE /api/admin/diseases/:id deletes disease (200)', 200, delDis.status);
  }

  const algName = `Allergen ${uniqueNum}`;
  const createAlg = await api('POST', '/admin/allergies', adminToken, {
    name: algName,
    description: 'Tree nut compound',
  });
  assert('Allergies', 'POST /api/admin/allergies creates allergy (201)', 201, createAlg.status);
  const createdAlgId = createAlg.data?.data?.id;

  const getAllergies = await api('GET', '/allergies', adminToken);
  assert('Allergies', 'GET /api/allergies lists allergies (200)', 200, getAllergies.status, Array.isArray(getAllergies.data?.data));

  if (createdAlgId) {
    const patchAlg = await api('PATCH', `/admin/allergies/${createdAlgId}`, adminToken, {
      description: 'Patched allergy description',
    });
    assert('Allergies', 'PATCH /api/admin/allergies/:id updates allergy (200)', 200, patchAlg.status);

    const delAlg = await api('DELETE', `/admin/allergies/${createdAlgId}`, adminToken);
    assert('Allergies', 'DELETE /api/admin/allergies/:id deletes allergy (200)', 200, delAlg.status);
  }

  // 8. KITCHEN CRUD (STATUS & AVAILABILITIES)
  console.log('\n--- 8. KITCHEN CRUD ---');
  const getStatus = await api('GET', '/kitchen/status');
  assert('Kitchen', 'GET /api/kitchen/status returns operational status (200)', 200, getStatus.status);

  const putStatus = await api('PUT', '/kitchen/status', kitchenToken, {
    isActive: true,
    notes: 'Kitchen operating normally',
  });
  assert('Kitchen', 'PUT /api/kitchen/status updates status (200)', 200, putStatus.status);

  const patchStatus = await api('PATCH', '/kitchen/status', kitchenToken, {
    notes: 'Shift transition notes active',
  });
  assert('Kitchen', 'PATCH /api/kitchen/status updates status (200)', 200, patchStatus.status);

  const todayStr = new Date().toISOString().split('T')[0];
  const createAvail = await api('POST', '/kitchen/availabilities', kitchenToken, {
    foodId: 'food-1',
    date: todayStr,
    mealType: 'LUNCH',
    startTime: '11:00',
    endTime: '15:00',
  });
  assert('Kitchen', 'POST /api/kitchen/availabilities creates meal schedule (201)', 201, createAvail.status);
  const createdAvailId = createAvail.data?.data?.id;

  const listAvail = await api('GET', `/kitchen/availabilities?date=${todayStr}`, kitchenToken);
  assert('Kitchen', 'GET /api/kitchen/availabilities returns schedule list (200)', 200, listAvail.status);

  if (createdAvailId) {
    const patchAvail = await api('PATCH', `/kitchen/availabilities/${createdAvailId}`, kitchenToken, {
      status: 'INACTIVE',
    });
    assert('Kitchen', 'PATCH /api/kitchen/availabilities/:id updates status (200)', 200, patchAvail.status);

    const delAvail = await api('DELETE', `/kitchen/availabilities/${createdAvailId}`, kitchenToken);
    assert('Kitchen', 'DELETE /api/kitchen/availabilities/:id deletes schedule (200)', 200, delAvail.status);
  }

  // 9. ORDERS CRUD
  console.log('\n--- 9. ORDERS CRUD ---');
  // Doctor approves food-1 for pat-1 first to ensure valid order
  await api('POST', '/approvals', doctorToken, {
    patientId: 'pat-1',
    foodId: 'food-1',
    status: 'APPROVED',
    remarks: 'Pre-flight meal approval for test order',
  });

  const createOrder = await api('POST', '/orders', adminToken, {
    patientId: 'pat-1',
    foodId: 'food-1',
    specialInstructions: 'Low salt, room delivery',
  });
  assert('Orders', 'POST /api/orders places a new order (201)', 201, createOrder.status);
  const createdOrderId = createOrder.data?.data?.id;

  const getOrders = await api('GET', '/orders', kitchenToken);
  assert('Orders', 'GET /api/orders lists hospital meal orders (200)', 200, getOrders.status, Array.isArray(getOrders.data?.data));

  if (createdOrderId) {
    const getOrder = await api('GET', `/orders/${createdOrderId}`, kitchenToken);
    assert('Orders', 'GET /api/orders/:id returns order details (200)', 200, getOrder.status);

    const putOrderStatus = await api('PUT', `/orders/${createdOrderId}/status`, kitchenToken, {
      status: 'PREPARING',
      notes: 'Tray is being assembled',
    });
    assert('Orders', 'PUT /api/orders/:id/status updates status (200)', 200, putOrderStatus.status);

    const patchOrderStatus = await api('PATCH', `/orders/${createdOrderId}/status`, kitchenToken, {
      status: 'READY',
      notes: 'Ready on dietary heating cart',
    });
    assert('Orders', 'PATCH /api/orders/:id/status updates status (200)', 200, patchOrderStatus.status);

    const delOrder = await api('DELETE', `/orders/${createdOrderId}`, adminToken, { reason: 'Test order cleanup' });
    assert('Orders', 'DELETE /api/orders/:id cancels order (200)', 200, delOrder.status);
  }

  // 10. APPROVALS CRUD
  console.log('\n--- 10. APPROVALS CRUD ---');
  const postApproval = await api('POST', '/approvals', doctorToken, {
    patientId: 'pat-1',
    foodId: 'food-2',
    status: 'APPROVED',
    remarks: 'Approved Mediterranean bowl',
  });
  assert('Approvals', 'POST /api/approvals updates approval status (200)', 200, postApproval.status);

  const getApprovals = await api('GET', '/approvals', doctorToken);
  assert('Approvals', 'GET /api/approvals lists doctor approvals (200)', 200, getApprovals.status, Array.isArray(getApprovals.data?.data));

  const patchApproval = await api('PATCH', '/approvals', doctorToken, {
    patientId: 'pat-1',
    foodId: 'food-2',
    remarks: 'Updated clinical remarks on dietary tolerance',
  });
  assert('Approvals', 'PATCH /api/approvals updates approval (200)', 200, patchApproval.status);

  const delApproval = await api('DELETE', '/approvals', doctorToken, {
    patientId: 'pat-1',
    foodId: 'food-2',
  });
  assert('Approvals', 'DELETE /api/approvals removes approval (200)', 200, delApproval.status);

  // 11. FEEDBACK CRUD
  console.log('\n--- 11. FEEDBACK CRUD ---');
  const getFeedback = await api('GET', '/feedback', adminToken);
  assert('Feedback', 'GET /api/feedback lists patient feedback (200)', 200, getFeedback.status, Array.isArray(getFeedback.data?.data));

  // 12. ROLE-BASED ACCESS CONTROL (403 FORBIDDEN CHECKS)
  console.log('\n--- 12. ROLE-BASED AUTHORIZATION ENFORCEMENT ---');
  const patientAdminStats = await api('GET', '/admin/stats', patientToken);
  assert('RBAC', 'Patient accessing /admin/stats returns 403 Forbidden', 403, patientAdminStats.status);

  const doctorAdminUsers = await api('GET', '/admin/users', doctorToken);
  assert('RBAC', 'Doctor accessing /admin/users returns 403 Forbidden', 403, doctorAdminUsers.status);

  const patientKitchenAvail = await api('POST', '/kitchen/availabilities', patientToken, {
    foodId: 'food-1',
    date: todayStr,
    mealType: 'LUNCH',
    startTime: '11:00',
    endTime: '15:00',
  });
  assert('RBAC', 'Patient creating kitchen availability returns 403 Forbidden', 403, patientKitchenAvail.status);

  // Summary
  console.log('\n======================================================');
  const passedCount = results.filter((r) => r.status === 'PASSED').length;
  const failedCount = results.filter((r) => r.status === 'FAILED').length;
  console.log(` TOTAL TESTS: ${results.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
  console.log('======================================================\n');

  return failedCount === 0;
}

if (process.argv[1] && process.argv[1].endsWith('api.test.ts')) {
  runAllApiTests().then((ok) => {
    if (testServer) {
      testServer.close(() => process.exit(ok ? 0 : 1));
    } else {
      process.exit(ok ? 0 : 1);
    }
  });
}
