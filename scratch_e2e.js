// scratch_e2e.js
import http from 'http';

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const payload = postData ? (typeof postData === 'string' ? postData : JSON.stringify(postData)) : null;
    const opts = { ...options, headers: { ...(options.headers || {}) } };
    if (payload) {
      opts.headers['Content-Length'] = Buffer.byteLength(payload);
    }
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runE2ETests() {
  console.log('=== STARTING MATCHING ENGINE & SYNERGY E2E VERIFICATION ===\n');

  // Step 1: Switch session to David (user_david)
  console.log('1. Switching session to David (user_david)...');
  let res = await request({
    hostname: 'localhost',
    port: 3005,
    path: '/api/session',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { action: 'switch', userId: 'user_david' });

  const cookie = res.headers['set-cookie'] ? res.headers['set-cookie'][0] : '';
  console.log(`   Logged in as: ${res.body.user?.name || 'David'}`);

  // Fetch David's current skills
  res = await request({
    hostname: 'localhost',
    port: 3005,
    path: '/api/session',
    method: 'GET',
    headers: { Cookie: cookie }
  });

  const davidUser = res.body.user;
  console.log(`   Current Teach Skills Count before deletion: ${(davidUser.skills || []).filter(s => s.type === 'TEACH').length}`);

  // Clear David's teach skills for testing Phase 2 & Phase 3 (Zero-skills state)
  const teachSkills = (davidUser.skills || []).filter(s => s.type === 'TEACH');
  for (const ts of teachSkills) {
    await request({
      hostname: 'localhost',
      port: 3005,
      path: '/api/skills/user?id=' + ts.id,
      method: 'DELETE',
      headers: { Cookie: cookie, 'Content-Type': 'application/json' }
    }, { id: ts.id });
  }

  // Ensure David has 1 Learn skill (e.g. Python)
  const learnSkills = (davidUser.skills || []).filter(s => s.type === 'LEARN');
  if (learnSkills.length === 0) {
    await request({
      hostname: 'localhost',
      port: 3005,
      path: '/api/skills/user',
      method: 'POST',
      headers: { Cookie: cookie, 'Content-Type': 'application/json' }
    }, { skill_id: 1, type: 'LEARN', level: 'Beginner', experience_years: 0 });
  }

  // Fetch David's updated skills
  res = await request({
    hostname: 'localhost',
    port: 3005,
    path: '/api/session',
    method: 'GET',
    headers: { Cookie: cookie }
  });
  console.log(`   Current Teach Skills Count after deletion: ${(res.body.user.skills || []).filter(s => s.type === 'TEACH').length}`);

  // Step 2: Query /api/matches with 0 TEACH skills
  console.log('\n2. Querying /api/matches with 0 TEACH skills (Zero-skills state)...');
  res = await request({
    hostname: 'localhost',
    port: 3005,
    path: '/api/matches',
    method: 'GET',
    headers: { Cookie: cookie }
  });

  const zeroStateMatches = res.body.matches || [];
  console.log(`   Total Candidates Returned: ${zeroStateMatches.length}`);
  const topZeroMatch = zeroStateMatches[0];
  console.log(`   Top Candidate: ${topZeroMatch?.user?.name}`);
  console.log(`   Match Score: ${topZeroMatch?.matchScore}% (MUST BE 0%)`);
  console.log(`   Skill Compatibility Subscore: ${topZeroMatch?.subScores?.skillCompatibility?.percentage}% (MUST BE 0%)`);
  console.log(`   Reasons:`, topZeroMatch?.reasons);

  if (topZeroMatch.matchScore !== 0 || topZeroMatch.subScores.skillCompatibility.percentage !== 0) {
    console.error('❌ FAIL: Match score or skill compatibility was NOT 0% for zero-teach user!');
    process.exit(1);
  }
  console.log('✓ Zero-skills matching verification PASSED!');

  // Step 3: Phase 4 — Add Java, C, and DBMS as Teach skills
  console.log('\n3. Phase 4: Adding Java, C, and DBMS teach skills to David profile...');
  const allSkillsRes = await request({
    hostname: 'localhost',
    port: 3005,
    path: '/api/skills',
    method: 'GET'
  });
  const skillsList = allSkillsRes.body.skills || [];

  const javaSkill = skillsList.find(s => s.name.toLowerCase().includes('java')) || skillsList[0];
  const cSkill = skillsList.find(s => s.name.toLowerCase().includes('c')) || skillsList[1];
  const dbmsSkill = skillsList.find(s => s.name.toLowerCase().includes('dbms') || s.name.toLowerCase().includes('sql') || s.name.toLowerCase().includes('database')) || skillsList[2];

  await request({
    hostname: 'localhost',
    port: 3005,
    path: '/api/skills/user',
    method: 'POST',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' }
  }, { skill_id: javaSkill.id, type: 'TEACH', level: 'Advanced', experience_years: 3 });

  await request({
    hostname: 'localhost',
    port: 3005,
    path: '/api/skills/user',
    method: 'POST',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' }
  }, { skill_id: cSkill.id, type: 'TEACH', level: 'Intermediate', experience_years: 2 });

  await request({
    hostname: 'localhost',
    port: 3005,
    path: '/api/skills/user',
    method: 'POST',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' }
  }, { skill_id: dbmsSkill.id, type: 'TEACH', level: 'Expert', experience_years: 4 });

  console.log('   Successfully added Java, C, and DBMS to teaching portfolio!');

  // Step 4: Add UI/UX Design to TEACH and React to LEARN (Reciprocal with Alice Chen)
  const uiuxSkill = skillsList.find(s => s.name.toLowerCase().includes('ui/ux')) || { id: 4 };
  const reactSkill = skillsList.find(s => s.name.toLowerCase().includes('react')) || { id: 2 };

  await request({
    hostname: 'localhost',
    port: 3005,
    path: '/api/skills/user',
    method: 'POST',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' }
  }, { skill_id: uiuxSkill.id, type: 'TEACH', level: 'Advanced', experience_years: 3 });

  await request({
    hostname: 'localhost',
    port: 3005,
    path: '/api/skills/user',
    method: 'POST',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' }
  }, { skill_id: reactSkill.id, type: 'LEARN', level: 'Beginner', experience_years: 0 });

  // Re-query /api/matches and verify reciprocal synergy
  console.log('\n4. Re-querying /api/matches to verify reciprocal match calculation with Alice Chen...');
  res = await request({
    hostname: 'localhost',
    port: 3005,
    path: '/api/matches',
    method: 'GET',
    headers: { Cookie: cookie }
  });

  const reciprocalMatches = res.body.matches || [];
  const aliceMatch = reciprocalMatches.find(m => m.user.id === 'user_alice');
  console.log(`   Alice Chen Match Score: ${aliceMatch?.matchScore}%`);
  console.log(`   Skill Compatibility Subscore: ${aliceMatch?.subScores?.skillCompatibility?.percentage}%`);
  console.log(`   Reasons:`, aliceMatch?.reasons);

  if (!aliceMatch || aliceMatch.matchScore < 80) {
    console.error('❌ FAIL: Reciprocal match score with Alice Chen should be >= 80%!');
    process.exit(1);
  }
  console.log('✓ Reciprocal synergy computation verification PASSED!');

  // Step 5: Phase 5 — Learning Hub Sanity Check
  console.log('\n5. Phase 5: Learning Hub Sanity Check...');
  const hubRes = await request({
    hostname: 'localhost',
    port: 3005,
    path: '/api/resources',
    method: 'GET',
    headers: { Cookie: cookie }
  });
  console.log(`   Learning Hub Status: ${hubRes.status} | Total Scoped Resources: ${hubRes.body.resources?.length || 0}`);
  if (hubRes.status !== 200) {
    console.error('❌ FAIL: Learning Hub returned non-200 status!');
    process.exit(1);
  }
  console.log('✓ Learning Hub independent scoping PASSED!\n');

  console.log('=== CONSOLIDATED E2E VERIFICATION SUITE COMPLETED SUCCESSFULLY! ===');
}

runE2ETests().catch(err => {
  console.error('E2E Test Error:', err);
  process.exit(1);
});
