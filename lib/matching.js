// lib/matching.js - Isolated Reciprocal Matching Algorithm & Explainability Engine

/**
 * Level hierarchy to calculate teaching-learning synergy
 */
const LEVEL_VALUES = {
  'Beginner': 1,
  'Intermediate': 2,
  'Advanced': 3,
  'Expert': 4
};

/**
 * Computes reciprocal match score and human-readable explainability breakdown between two users
 * 
 * Formula:
 *   35% Skill Compatibility (TEACH/LEARN overlap)
 * + 25% Reciprocal Compatibility (two-way reciprocal match)
 * + 15% Level Compatibility (proficiency delta)
 * + 10% Availability Compatibility (shared schedule)
 * + 10% Goal Compatibility (experience / language / profile alignment)
 * +  5% Trust Score (ratings & profile verification)
 */
export function calculateMatchScore(userA, userB) {
  if (!userA || !userB || userA.id === userB.id) {
    return {
      matchScore: 0,
      subScores: {},
      reasons: [],
      matchedSkills: { userATeachesUserB: [], userBTeachesUserA: [] }
    };
  }

  const aSkills = userA.skills || [];
  const bSkills = userB.skills || [];

  const aTeach = aSkills.filter(s => s.type === 'TEACH');
  const aLearn = aSkills.filter(s => s.type === 'LEARN');
  const bTeach = bSkills.filter(s => s.type === 'TEACH');
  const bLearn = bSkills.filter(s => s.type === 'LEARN');

  // 1. Skill Compatibility (35%) & Reciprocal Detection (25%)
  // A teaches -> B learns
  const aTeachesB = [];
  for (const t of aTeach) {
    const matched = bLearn.find(l => 
      l.skill_id === t.skill_id || 
      (l.skill_name && t.skill_name && l.skill_name.toLowerCase() === t.skill_name.toLowerCase())
    );
    if (matched) {
      aTeachesB.push({
        skill_id: t.skill_id,
        skill_name: t.skill_name || matched.skill_name,
        teacherLevel: t.level || 'Advanced',
        learnerLevel: matched.level || 'Beginner',
        category: t.category_name || matched.category_name
      });
    }
  }

  // B teaches -> A learns
  const bTeachesA = [];
  for (const t of bTeach) {
    const matched = aLearn.find(l => 
      l.skill_id === t.skill_id || 
      (l.skill_name && t.skill_name && l.skill_name.toLowerCase() === t.skill_name.toLowerCase())
    );
    if (matched) {
      bTeachesA.push({
        skill_id: t.skill_id,
        skill_name: t.skill_name || matched.skill_name,
        teacherLevel: t.level || 'Advanced',
        learnerLevel: matched.level || 'Beginner',
        category: t.category_name || matched.category_name
      });
    }
  }

  // Check category-level fallback synergy if exact skill match is missing
  const aTeachCat = new Set(aTeach.map(s => s.category_id || s.category_name));
  const bLearnCat = new Set(bLearn.map(s => s.category_id || s.category_name));
  const bTeachCat = new Set(bTeach.map(s => s.category_id || s.category_name));
  const aLearnCat = new Set(aLearn.map(s => s.category_id || s.category_name));

  const catOverlapAToB = [...aTeachCat].some(c => bLearnCat.has(c));
  const catOverlapBToA = [...bTeachCat].some(c => aLearnCat.has(c));

  // --- Subscore 1: Skill Compatibility (Max 35) ---
  let rawSkillCompat = 0;
  if (aTeachesB.length > 0 && bTeachesA.length > 0) {
    rawSkillCompat = 100;
  } else if (aTeachesB.length > 0 || bTeachesA.length > 0) {
    rawSkillCompat = 70;
  } else if (catOverlapAToB && catOverlapBToA) {
    rawSkillCompat = 50;
  } else if (catOverlapAToB || catOverlapBToA) {
    rawSkillCompat = 30;
  } else {
    rawSkillCompat = 10;
  }
  const scoreSkillCompat = (rawSkillCompat / 100) * 35;

  // --- Subscore 2: Reciprocal Compatibility (Max 25) ---
  let rawReciprocal = 0;
  const isDirectReciprocal = aTeachesB.length > 0 && bTeachesA.length > 0;
  if (isDirectReciprocal) {
    rawReciprocal = 100;
  } else if ((aTeachesB.length > 0 && catOverlapBToA) || (bTeachesA.length > 0 && catOverlapAToB)) {
    rawReciprocal = 75;
  } else if (aTeachesB.length > 0 || bTeachesA.length > 0) {
    rawReciprocal = 45;
  } else if (catOverlapAToB && catOverlapBToA) {
    rawReciprocal = 30;
  } else {
    rawReciprocal = 0;
  }
  const scoreReciprocal = (rawReciprocal / 100) * 25;

  // --- Subscore 3: Level Compatibility (Max 15) ---
  let rawLevel = 50; // base
  const allMatches = [...aTeachesB, ...bTeachesA];
  if (allMatches.length > 0) {
    let levelPoints = 0;
    for (const m of allMatches) {
      const tVal = LEVEL_VALUES[m.teacherLevel] || 3;
      const lVal = LEVEL_VALUES[m.learnerLevel] || 1;
      if (tVal >= lVal + 2) levelPoints += 100; // Expert teaching Beginner
      else if (tVal >= lVal + 1) levelPoints += 90; // Advanced teaching Beginner/Inter
      else if (tVal >= lVal) levelPoints += 75; // Same level peer review
      else levelPoints += 40;
    }
    rawLevel = Math.min(100, Math.round(levelPoints / allMatches.length));
  } else {
    rawLevel = 50;
  }
  const scoreLevel = (rawLevel / 100) * 15;

  // --- Subscore 4: Availability Compatibility (Max 10) ---
  let rawAvailability = 50;
  const availA = (userA.profile?.availability || '').toLowerCase();
  const availB = (userB.profile?.availability || '').toLowerCase();
  
  if (availA && availB) {
    const slots = ['evening', 'weekend', 'morning', 'weekday', 'flexible', 'afternoon'];
    let matches = 0;
    for (const slot of slots) {
      if (availA.includes(slot) && availB.includes(slot)) matches++;
    }
    if (availA.includes('flexible') || availB.includes('flexible')) matches += 2;
    
    if (matches >= 2) rawAvailability = 100;
    else if (matches === 1) rawAvailability = 80;
    else rawAvailability = 55;
  }
  const scoreAvailability = (rawAvailability / 100) * 10;

  // --- Subscore 5: Goal Compatibility (Max 10) ---
  let rawGoal = 60;
  const langA = (userA.profile?.preferred_language || 'English').toLowerCase();
  const langB = (userB.profile?.preferred_language || 'English').toLowerCase();
  const sharedLang = langA.split(',').some(l => langB.includes(l.trim()));
  
  if (sharedLang) rawGoal += 25;
  if (userA.profile?.location && userB.profile?.location) rawGoal += 15;
  rawGoal = Math.min(100, rawGoal);
  const scoreGoal = (rawGoal / 100) * 10;

  // --- Subscore 6: Trust Score (Max 5) ---
  let rawTrust = 70;
  const ratingB = userB.reviews?.avg_rating || 5.0;
  const reviewsCountB = userB.reviews?.count || 1;
  const completionB = userB.profile?.completion_percentage || 80;

  rawTrust = Math.min(100, Math.round((ratingB / 5.0) * 60 + (completionB / 100) * 30 + Math.min(10, reviewsCountB * 2)));
  const scoreTrust = (rawTrust / 100) * 5;

  // Final aggregate score (0 to 100)
  const totalScore = Math.min(100, Math.round(
    scoreSkillCompat + scoreReciprocal + scoreLevel + scoreAvailability + scoreGoal + scoreTrust
  ));

  // Generate 2-4 plain-language reasons for the "Why this match?" breakdown
  const reasons = [];

  if (isDirectReciprocal) {
    const aTeachesNames = aTeachesB.map(s => s.skill_name).join(', ');
    const bTeachesNames = bTeachesA.map(s => s.skill_name).join(', ');
    reasons.push(`🎯 Perfect Reciprocal Match: You teach ${aTeachesNames}, and they teach ${bTeachesNames}.`);
  } else if (bTeachesA.length > 0) {
    const bTeachesNames = bTeachesA.map(s => s.skill_name).join(', ');
    reasons.push(`✨ High Demand: They teach ${bTeachesNames} which is in your target learning list.`);
  } else if (aTeachesB.length > 0) {
    const aTeachesNames = aTeachesB.map(s => s.skill_name).join(', ');
    reasons.push(`💡 Mentorship Opportunity: You teach ${aTeachesNames} which they are eager to learn.`);
  }

  if (rawLevel >= 80 && allMatches.length > 0) {
    const mentorSkill = bTeachesA[0] || aTeachesB[0];
    reasons.push(`⚡ Level Synergy: Proficient mentoring dynamic with ${mentorSkill.teacherLevel} expertise.`);
  }

  if (rawAvailability >= 80) {
    const commonSlots = [];
    if (availA.includes('evening') && availB.includes('evening')) commonSlots.push('evenings');
    if (availA.includes('weekend') && availB.includes('weekend')) commonSlots.push('weekends');
    if (availA.includes('flexible') || availB.includes('flexible')) commonSlots.push('flexible timing');
    const scheduleStr = commonSlots.length > 0 ? commonSlots.join(' and ') : 'overlapping free times';
    reasons.push(`⏰ High Schedule Compatibility: Aligned availability during ${scheduleStr}.`);
  }

  if (ratingB >= 4.8 && reviewsCountB >= 1) {
    reasons.push(`🌟 Highly Rated Peer: ${ratingB.toFixed(1)}★ verified community rating.`);
  } else if (sharedLang) {
    reasons.push(`🗣️ Communication Alignment: Shared language preference (${userB.profile?.preferred_language || 'English'}).`);
  }

  // Ensure at least 2 reasons always
  if (reasons.length < 2) {
    reasons.push(`🤝 Great Community Fit: Active profile ready for peer exchange.`);
  }

  return {
    matchScore: totalScore,
    subScores: {
      skillCompatibility: { score: Number(scoreSkillCompat.toFixed(1)), max: 35, percentage: rawSkillCompat },
      reciprocalCompatibility: { score: Number(scoreReciprocal.toFixed(1)), max: 25, percentage: rawReciprocal },
      levelCompatibility: { score: Number(scoreLevel.toFixed(1)), max: 15, percentage: rawLevel },
      availabilityCompatibility: { score: Number(scoreAvailability.toFixed(1)), max: 10, percentage: rawAvailability },
      goalCompatibility: { score: Number(scoreGoal.toFixed(1)), max: 10, percentage: rawGoal },
      trustScore: { score: Number(scoreTrust.toFixed(1)), max: 5, percentage: rawTrust }
    },
    reasons: reasons.slice(0, 4),
    matchedSkills: {
      userATeachesUserB: aTeachesB,
      userBTeachesUserA: bTeachesA,
      isDirectReciprocal
    }
  };
}