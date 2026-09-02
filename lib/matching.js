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

  // Check if either profile has 0 teach skills or 0 learn skills
  const isProfileCompleteA = aTeach.length > 0 && aLearn.length > 0;
  const isProfileCompleteB = bTeach.length > 0 && bLearn.length > 0;

  // 1. Skill Compatibility & Reciprocal Detection
  const aTeachesB = [];
  if (aTeach.length > 0 && bLearn.length > 0) {
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
  }

  const bTeachesA = [];
  if (bTeach.length > 0 && aLearn.length > 0) {
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
  }

  // Check category-level fallback synergy if exact skill match is missing
  const aTeachCat = new Set(aTeach.map(s => s.category_id || s.category_name));
  const bLearnCat = new Set(bLearn.map(s => s.category_id || s.category_name));
  const bTeachCat = new Set(bTeach.map(s => s.category_id || s.category_name));
  const aLearnCat = new Set(aLearn.map(s => s.category_id || s.category_name));

  const catOverlapAToB = aTeach.length > 0 && bLearn.length > 0 && [...aTeachCat].some(c => bLearnCat.has(c));
  const catOverlapBToA = bTeach.length > 0 && aLearn.length > 0 && [...bTeachCat].some(c => aLearnCat.has(c));

  // --- Subscore 1: Skill Compatibility (Max 35) & Subscore 2: Reciprocal Compatibility (Max 25) ---
  let rawSkillCompat = 0;
  let rawReciprocal = 0;
  const isDirectReciprocal = aTeachesB.length > 0 && bTeachesA.length > 0;

  if (!isProfileCompleteA || !isProfileCompleteB) {
    // If either user has no skills offered to teach or learn, reciprocity is mathematically impossible
    rawSkillCompat = 0;
    rawReciprocal = 0;
  } else if (isDirectReciprocal) {
    // Perfect reciprocal match: A teaches B and B teaches A
    rawSkillCompat = 100;
    rawReciprocal = 100;
  } else if ((aTeachesB.length > 0 && catOverlapBToA) || (bTeachesA.length > 0 && catOverlapAToB)) {
    // Exact skill match in one direction + category match in the other
    rawSkillCompat = 70;
    rawReciprocal = 60;
  } else if (catOverlapAToB && catOverlapBToA) {
    // Both directions match at category level
    rawSkillCompat = 50;
    rawReciprocal = 40;
  } else {
    // No two-way skill or category reciprocity exists
    rawSkillCompat = 0;
    rawReciprocal = 0;
  }

  const scoreSkillCompat = (rawSkillCompat / 100) * 35;
  const scoreReciprocal = (rawReciprocal / 100) * 25;

  // If there is no reciprocal skill overlap, total score MUST be 0%
  const hasReciprocalSynergy = rawSkillCompat > 0 && rawReciprocal > 0;

  // --- Subscore 3: Level Compatibility (Max 15) ---
  let rawLevel = 0;
  const allMatches = [...aTeachesB, ...bTeachesA];
  if (hasReciprocalSynergy && allMatches.length > 0) {
    let levelPoints = 0;
    for (const m of allMatches) {
      const tVal = LEVEL_VALUES[m.teacherLevel] || 3;
      const lVal = LEVEL_VALUES[m.learnerLevel] || 1;
      if (tVal >= lVal + 2) levelPoints += 100;
      else if (tVal >= lVal + 1) levelPoints += 90;
      else if (tVal >= lVal) levelPoints += 75;
      else levelPoints += 40;
    }
    rawLevel = Math.min(100, Math.round(levelPoints / allMatches.length));
  } else {
    rawLevel = 0;
  }
  const scoreLevel = (rawLevel / 100) * 15;

  // --- Subscore 4: Availability Compatibility (Max 10) ---
  let rawAvailability = 0;
  const availA = (userA.profile?.availability || '').toLowerCase();
  const availB = (userB.profile?.availability || '').toLowerCase();
  
  if (hasReciprocalSynergy && availA && availB) {
    const slots = ['evening', 'weekend', 'morning', 'weekday', 'flexible', 'afternoon'];
    let matchesCount = 0;
    for (const slot of slots) {
      if (availA.includes(slot) && availB.includes(slot)) matchesCount++;
    }
    if (availA.includes('flexible') || availB.includes('flexible')) matchesCount += 2;
    
    if (matchesCount >= 2) rawAvailability = 100;
    else if (matchesCount === 1) rawAvailability = 80;
    else rawAvailability = 55;
  }
  const scoreAvailability = (rawAvailability / 100) * 10;

  // --- Subscore 5: Goal Compatibility (Max 10) ---
  let rawGoal = 0;
  if (hasReciprocalSynergy) {
    rawGoal = 60;
    const langA = (userA.profile?.preferred_language || 'English').toLowerCase();
    const langB = (userB.profile?.preferred_language || 'English').toLowerCase();
    const sharedLang = langA.split(',').some(l => langB.includes(l.trim()));
    if (sharedLang) rawGoal += 25;
    if (userA.profile?.location && userB.profile?.location) rawGoal += 15;
    rawGoal = Math.min(100, rawGoal);
  }
  const scoreGoal = (rawGoal / 100) * 10;

  // --- Subscore 6: Trust Score (Max 5) ---
  let rawTrust = 0;
  if (hasReciprocalSynergy) {
    const ratingB = userB.reviews?.avg_rating || 5.0;
    const reviewsCountB = userB.reviews?.count || 1;
    const completionB = userB.profile?.completion_percentage || 80;
    rawTrust = Math.min(100, Math.round((ratingB / 5.0) * 60 + (completionB / 100) * 30 + Math.min(10, reviewsCountB * 2)));
  }
  const scoreTrust = (rawTrust / 100) * 5;

  // Final aggregate score (0 to 100)
  const totalScore = hasReciprocalSynergy
    ? Math.min(100, Math.round(scoreSkillCompat + scoreReciprocal + scoreLevel + scoreAvailability + scoreGoal + scoreTrust))
    : 0;

  // Generate plain-language reasons
  const reasons = [];

  if (!isProfileCompleteA) {
    reasons.push(`💡 Complete Your Profile: Add topics you can teach to enable 1:1 reciprocal matchmaking.`);
  } else if (!hasReciprocalSynergy) {
    reasons.push(`🔍 Network Member: Active platform user (no direct reciprocal skill match yet).`);
  } else if (isDirectReciprocal) {
    const aTeachesNames = aTeachesB.map(s => s.skill_name).join(', ');
    const bTeachesNames = bTeachesA.map(s => s.skill_name).join(', ');
    reasons.push(`🎯 Perfect Reciprocal Match: You teach ${aTeachesNames}, and they teach ${bTeachesNames}.`);
  } else if (aTeachesB.length > 0) {
    const aTeachesNames = aTeachesB.map(s => s.skill_name).join(', ');
    reasons.push(`💡 Category Synergy: You teach ${aTeachesNames} with complementary learning goals.`);
  }

  if (hasReciprocalSynergy && rawLevel >= 80 && allMatches.length > 0) {
    const mentorSkill = bTeachesA[0] || aTeachesB[0];
    reasons.push(`⚡ Level Synergy: Proficient mentoring dynamic with ${mentorSkill.teacherLevel} expertise.`);
  }

  if (reasons.length < 2) {
    reasons.push(`🤝 Active Swapper: Verified member with ${userB.reviews?.avg_rating || 5.0}★ reputation.`);
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