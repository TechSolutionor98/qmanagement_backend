// Test script for role-based login restrictions
const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Test credentials (you need to update these with actual test data from your database)
const testData = {
  user: {
    email: 'user@test.com',  // Update with actual user email
    password: 'password123',
    expectedRole: 'user'
  },
  admin: {
    email: 'admin@test.com', // Update with actual admin email
    password: 'admin123',
    expectedRole: 'admin'
  },
  superAdmin: {
    email: 'superadmin@test.com', // Update with actual super admin email
    password: 'super123',
    expectedRole: 'super_admin'
  },
  receptionist: {
    email: 'receptionist@test.com', // Update with actual receptionist email
    password: 'password123',
    expectedRole: 'receptionist'
  }
};

async function testLogin(endpoint, credentials, shouldSucceed, testName) {
  console.log(`\n${colors.blue}Testing: ${testName}${colors.reset}`);
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Email: ${credentials.email}`);
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      }),
    });

    const data = await response.json();

    if (shouldSucceed) {
      if (response.ok) {
        console.log(`${colors.green}✅ PASS: Login successful as expected${colors.reset}`);
        console.log(`   User: ${data.user.username}, Role: ${data.user.role}`);
        return true;
      } else {
        console.log(`${colors.red}❌ FAIL: Login should have succeeded but failed${colors.reset}`);
        console.log(`   Error: ${data.message}`);
        return false;
      }
    } else {
      if (!response.ok) {
        console.log(`${colors.green}✅ PASS: Login blocked as expected${colors.reset}`);
        console.log(`   Error message: ${data.message}`);
        return true;
      } else {
        console.log(`${colors.red}❌ FAIL: Login should have been blocked but succeeded${colors.reset}`);
        console.log(`   User: ${data.user.username}, Role: ${data.user.role}`);
        return false;
      }
    }
  } catch (error) {
    console.log(`${colors.red}❌ ERROR: ${error.message}${colors.reset}`);
    return false;
  }
}

async function runTests() {
  console.log(`${colors.yellow}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.yellow}   Role-Based Login Restriction Tests${colors.reset}`);
  console.log(`${colors.yellow}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`API URL: ${API_URL}\n`);

  const results = {
    passed: 0,
    failed: 0
  };

  // Test 1: User with role='user' should login successfully
  if (await testLogin(
    `${API_URL}/auth/user/login`,
    testData.user,
    true,
    "Test 1: User login with role='user' (Should PASS)"
  )) results.passed++; else results.failed++;

  // Test 2: Admin with role='admin' should login successfully
  if (await testLogin(
    `${API_URL}/auth/admin/login`,
    testData.admin,
    true,
    "Test 2: Admin login with role='admin' (Should PASS)"
  )) results.passed++; else results.failed++;

  // Test 3: Super Admin with role='super_admin' should login successfully
  if (await testLogin(
    `${API_URL}/auth/secure-admin-access/super-login-2024`,
    testData.superAdmin,
    true,
    "Test 3: Super Admin login with role='super_admin' (Should PASS)"
  )) results.passed++; else results.failed++;

  // Test 4: Receptionist should be BLOCKED from user login
  if (await testLogin(
    `${API_URL}/auth/user/login`,
    testData.receptionist,
    false,
    "Test 4: Receptionist login attempt (Should be BLOCKED)"
  )) results.passed++; else results.failed++;

  // Test 5: Admin should be BLOCKED from user login endpoint
  if (await testLogin(
    `${API_URL}/auth/user/login`,
    testData.admin,
    false,
    "Test 5: Admin trying user endpoint (Should be BLOCKED)"
  )) results.passed++; else results.failed++;

  // Test 6: User should be BLOCKED from admin login endpoint
  if (await testLogin(
    `${API_URL}/auth/admin/login`,
    testData.user,
    false,
    "Test 6: User trying admin endpoint (Should be BLOCKED)"
  )) results.passed++; else results.failed++;

  // Test 7: Super Admin should be BLOCKED from regular admin endpoint
  if (await testLogin(
    `${API_URL}/auth/admin/login`,
    testData.superAdmin,
    false,
    "Test 7: Super Admin trying admin endpoint (Should be BLOCKED)"
  )) results.passed++; else results.failed++;

  // Print summary
  console.log(`\n${colors.yellow}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.yellow}   Test Results Summary${colors.reset}`);
  console.log(`${colors.yellow}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`Total: ${results.passed + results.failed}`);
  
  if (results.failed === 0) {
    console.log(`\n${colors.green}🎉 All tests passed! Role-based login restriction is working correctly.${colors.reset}`);
  } else {
    console.log(`\n${colors.red}⚠️ Some tests failed. Please check the implementation.${colors.reset}`);
  }
  console.log(`${colors.yellow}═══════════════════════════════════════════════════════${colors.reset}\n`);
}

// Print instructions
console.log(`${colors.yellow}⚠️ IMPORTANT: Update test credentials in the script before running!${colors.reset}`);
console.log(`   Edit the 'testData' object with actual email/password from your database.\n`);

// Run tests
runTests().catch(console.error);
