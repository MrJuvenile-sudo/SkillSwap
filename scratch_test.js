// scratch_test.js
import { calculateMatchScore } from './lib/matching.js';

console.log('=== VERIFYING MATCHING & SYNERGY ALGORITHM ===\n');

// 1. User A with ZERO teach skills, 1 learn skill vs User B
const userA_zeroTeach = {
  id: 'user_test1',
  name: 'Test Learner Only',
  skills: [
    { skill_id: 1, skill_name: 'Python', type: 'LEARN', level: 'Beginner' }
  ]
};

const userB_alice = {
  id: 'user_alice',
  name: 'Alice Chen',
  skills: [
    { skill_id: 1, skill_name: 'Python', type: 'TEACH', level: 'Expert', category_name: 'Engineering' },
    { skill_id: 2, skill_name: 'React', type: 'TEACH', level: 'Advanced', category_name: 'Engineering' },
    { skill_id: 3, skill_name: 'UI/UX Design', type: 'LEARN', level: 'Beginner', category_name: 'Design' }
  ],
  reviews: { avg_rating: 4.9, count: 12 },
  profile: { availability: 'Evenings', preferred_language: 'English', location: 'San Francisco, CA' }
};

const res1 = calculateMatchScore(userA_zeroTeach, userB_alice);

console.log('Test 1: Zero-Teach User vs Alice Chen:');
console.log(' - Match Score:', res1.matchScore, '% (Expected: 0%)');
console.log(' - Skill Compatibility Subscore:', res1.subScores.skillCompatibility.percentage, '% (Expected: 0%)');
console.log(' - Reciprocal Compatibility Subscore:', res1.subScores.reciprocalCompatibility.percentage, '% (Expected: 0%)');
console.log(' - Reasons:', res1.reasons);
if (res1.matchScore !== 0 || res1.subScores.skillCompatibility.percentage !== 0 || res1.subScores.reciprocalCompatibility.percentage !== 0) {
  console.error('❌ Test 1 FAILED!');
  process.exit(1);
}
console.log('✓ Test 1 PASSED!\n');

// 2. User A with 1 Teach (UI/UX Design) & 1 Learn (Python) vs Alice Chen (Teaches Python, Learns UI/UX Design)
const userA_reciprocal = {
  id: 'user_test2',
  name: 'Test Reciprocal User',
  skills: [
    { skill_id: 3, skill_name: 'UI/UX Design', type: 'TEACH', level: 'Advanced', category_name: 'Design' },
    { skill_id: 1, skill_name: 'Python', type: 'LEARN', level: 'Beginner', category_name: 'Engineering' }
  ],
  reviews: { avg_rating: 5.0, count: 5 },
  profile: { availability: 'Evenings', preferred_language: 'English', location: 'San Francisco, CA' }
};

const res2 = calculateMatchScore(userA_reciprocal, userB_alice);

console.log('Test 2: Reciprocal User vs Alice Chen:');
console.log(' - Match Score:', res2.matchScore, '% (Expected: > 85%)');
console.log(' - Skill Compatibility Subscore:', res2.subScores.skillCompatibility.percentage, '% (Expected: 100%)');
console.log(' - Reciprocal Compatibility Subscore:', res2.subScores.reciprocalCompatibility.percentage, '% (Expected: 100%)');
console.log(' - Reasons:', res2.reasons);
if (res2.matchScore <= 85 || res2.subScores.skillCompatibility.percentage !== 100 || res2.subScores.reciprocalCompatibility.percentage !== 100) {
  console.error('❌ Test 2 FAILED!');
  process.exit(1);
}
console.log('✓ Test 2 PASSED!\n');

console.log('=== ALL SYNERGY ALGORITHM UNIT TESTS PASSED SUCCESSFULLY! ===');
