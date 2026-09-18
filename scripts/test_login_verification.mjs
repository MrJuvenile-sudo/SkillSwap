// scratch/test_login_verification.mjs - Comprehensive Login & Auth Verification
import http from 'http';
import app from '../server.js';

function request(server, options, postData = null) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const reqOptions = {
      hostname: '127.0.0.1',
      port: addr.port,
      ...options
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch {}
        resolve({ status: res.statusCode, headers: res.headers, body, json });
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  console.log(`\n🧪 Test server started on port ${port}\n`);

  let allPassed = true;

  try {
    // Test 1: Admin Login with 'admin' and 'Admin@123'
    console.log('[Test 1] Testing Admin login with username "admin" & "Admin@123"...');
    const admin1 = await request(server, {
      path: '/api/account/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin', password: 'Admin@123' });

    console.log(`  -> Status: ${admin1.status}, Success: ${admin1.json?.success}, Role: ${admin1.json?.user?.role}, Name: ${admin1.json?.user?.name}`);
    if (admin1.status !== 200 || !admin1.json?.success || admin1.json?.user?.role !== 'SUPER_ADMIN') {
      console.error('  ❌ Test 1 Failed!');
      allPassed = false;
    } else {
      console.log('  ✓ Test 1 Passed!');
    }

    const adminCookie = admin1.headers['set-cookie']?.[0] || '';
    const adminToken = admin1.json?.token;

    // Test 2: Admin Login with email 'admin@skillswap.io' and 'Admin123!'
    console.log('\n[Test 2] Testing Admin login with email "admin@skillswap.io" & "Admin123!"...');
    const admin2 = await request(server, {
      path: '/api/account/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@skillswap.io', password: 'Admin123!' });

    console.log(`  -> Status: ${admin2.status}, Success: ${admin2.json?.success}, Role: ${admin2.json?.user?.role}`);
    if (admin2.status !== 200 || !admin2.json?.success) {
      console.error('  ❌ Test 2 Failed!');
      allPassed = false;
    } else {
      console.log('  ✓ Test 2 Passed!');
    }

    // Test 3: Regular User Login
    console.log('\n[Test 3] Testing User login with "ramesh@gmail.com" / "ramesh" & password...');
    const user1 = await request(server, {
      path: '/api/account/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'ramesh@gmail.com', password: 'password' });

    console.log(`  -> Status: ${user1.status}, Success: ${user1.json?.success}, Role: ${user1.json?.user?.role}, Name: ${user1.json?.user?.name}`);
    if (user1.status !== 200 || !user1.json?.success) {
      console.error('  ❌ Test 3 Failed!');
      allPassed = false;
    } else {
      console.log('  ✓ Test 3 Passed!');
    }

    // Test 4: Authenticated Session Check (/api/session)
    console.log('\n[Test 4] Testing Session Resolution (/api/session) with Cookie & Bearer Token...');
    const sessionRes = await request(server, {
      path: '/api/session',
      method: 'GET',
      headers: {
        'Cookie': adminCookie,
        'Authorization': `Bearer ${adminToken}`
      }
    });

    console.log(`  -> Status: ${sessionRes.status}, User ID: ${sessionRes.json?.user?.id}, Role: ${sessionRes.json?.user?.role}`);
    if (sessionRes.status !== 200 || sessionRes.json?.user?.role !== 'SUPER_ADMIN') {
      console.error('  ❌ Test 4 Failed!');
      allPassed = false;
    } else {
      console.log('  ✓ Test 4 Passed!');
    }

    // Test 5: Admin Overview Data (/api/admin)
    console.log('\n[Test 5] Testing Admin Overview Data (/api/admin)...');
    const overviewRes = await request(server, {
      path: '/api/admin',
      method: 'GET',
      headers: { 'Cookie': adminCookie }
    });

    console.log(`  -> Status: ${overviewRes.status}, Total Users KPI: ${overviewRes.json?.analytics?.users?.total_users}`);
    if (overviewRes.status !== 200 || !overviewRes.json?.analytics) {
      console.error('  ❌ Test 5 Failed!');
      allPassed = false;
    } else {
      console.log('  ✓ Test 5 Passed!');
    }

    // Test 6: Admin Users Data (/api/admin/users)
    console.log('\n[Test 6] Testing Admin Users List (/api/admin/users)...');
    const usersRes = await request(server, {
      path: '/api/admin/users',
      method: 'GET',
      headers: { 'Cookie': adminCookie }
    });

    console.log(`  -> Status: ${usersRes.status}, Users Count: ${usersRes.json?.users?.length}`);
    if (usersRes.status !== 200 || !Array.isArray(usersRes.json?.users)) {
      console.error('  ❌ Test 6 Failed!');
      allPassed = false;
    } else {
      console.log('  ✓ Test 6 Passed!');
    }

    // Test 7: Invalid Login Handling (Wrong password)
    console.log('\n[Test 7] Testing Invalid Login (wrong password)...');
    const invalidRes = await request(server, {
      path: '/api/account/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin', password: 'WrongPassword999!' });

    console.log(`  -> Status: ${invalidRes.status}, Error: ${invalidRes.json?.error}`);
    if (invalidRes.status !== 401) {
      console.error('  ❌ Test 7 Failed!');
      allPassed = false;
    } else {
      console.log('  ✓ Test 7 Passed (clean 401 returned)!');
    }

    // Test 8: Non-existent API endpoint returns JSON 404 (not HTML)
    console.log('\n[Test 8] Testing Non-existent API endpoint returns JSON 404...');
    const notFoundRes = await request(server, {
      path: '/api/non_existent_route',
      method: 'GET'
    });

    console.log(`  -> Status: ${notFoundRes.status}, Body: ${notFoundRes.body}`);
    if (notFoundRes.status !== 404 || !notFoundRes.json?.error) {
      console.error('  ❌ Test 8 Failed!');
      allPassed = false;
    } else {
      console.log('  ✓ Test 8 Passed (clean JSON 404 returned)!');
    }

  } catch (err) {
    console.error('Unexpected test error:', err);
    allPassed = false;
  } finally {
    server.close();
  }

  if (allPassed) {
    console.log('\n🎉 ALL 8 TESTS PASSED PERFECTLY! Authentication, Admin panel, and Routing are 100% operational!\n');
    process.exit(0);
  } else {
    console.error('\n❌ SOME TESTS FAILED!\n');
    process.exit(1);
  }
}

runTests();
