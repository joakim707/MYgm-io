import { v4 as uuid } from "uuid";
import type {
  BookedSegment,
  GMSave,
  Rivalry,
  SegmentResult,
  ShowResult,
  Superstar,
} from "./types";

function clamp(val: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, val));
}

function rand(range: number) {
  return (Math.random() - 0.5) * range;
}

function getRivalry(save: GMSave, ids: string[]): Rivalry | undefined {
  return save.rivalries.find(
    (r) =>
      r.active &&
      ids.includes(r.superstarAId) &&
      ids.includes(r.superstarBId)
  );
}

function simulateMatchSegment(
  segment: BookedSegment,
  save: GMSave
): SegmentResult {
  const participants = segment.participants
    .map((id) => save.roster.find((s) => s.id === id))
    .filter(Boolean) as Superstar[];

  if (participants.length < 2) {
    return { segmentId: segment.id, type: segment.type, score: 20, highlights: ["Match annulé (participants manquants)"] };
  }

  const rivalry = getRivalry(save, segment.participants);
  const avgRing = participants.reduce((s, p) => s + p.inRing, 0) / participants.length;
  const avgStamina = participants.reduce((s, p) => s + p.stamina, 0) / participants.length;
  const momentumBonus = participants.reduce((s, p) => s + p.momentum, 0) / participants.length;
  const chemistryBonus = rivalry ? rivalry.chemistry * 0.2 : 0;
  const rivalryBonus = rivalry ? (rivalry.intensity / 100) * 15 : 0;
  const staminaPenalty = (100 - avgStamina) * 0.3;

  let score = avgRing + chemistryBonus + rivalryBonus + momentumBonus - staminaPenalty + rand(10);
  score = clamp(score);

  // Title match bonus
  if (segment.titleId) score = clamp(score + 10);

  // Main event bonus
  if (segment.isMainEvent) score = clamp(score + 5);

  // Determine winner (higher momentum/popularity wins)
  const sorted = [...participants].sort(
    (a, b) => b.popularity + b.momentum - (a.popularity + a.momentum)
  );
  const winner = sorted[0];

  const highlights: string[] = [];
  if (rivalry) highlights.push(`Rivalité tendue entre ${participants.map((p) => p.name).join(" et ")}`);
  if (segment.titleId) highlights.push("Titre en jeu !");
  if (score >= 75) highlights.push("Match 5 étoiles !");
  else if (score >= 55) highlights.push("Bon match");
  else highlights.push("Match décevant");

  return {
    segmentId: segment.id,
    type: segment.type,
    score: Math.round(score),
    winnerId: winner.id,
    highlights,
  };
}

function simulatePromoSegment(
  segment: BookedSegment,
  save: GMSave
): SegmentResult {
  const participants = segment.participants
    .map((id) => save.roster.find((s) => s.id === id))
    .filter(Boolean) as Superstar[];

  if (participants.length === 0) {
    return { segmentId: segment.id, type: segment.type, score: 10, highlights: ["Promo annulée"] };
  }

  const rivalry = getRivalry(save, segment.participants);
  const avgMic = participants.reduce((s, p) => s + p.mic, 0) / participants.length;
  const rivalryBonus = rivalry ? (rivalry.intensity / 100) * 10 : 0;
  const momentumBonus = participants.reduce((s, p) => s + p.momentum, 0) / participants.length * 0.5;

  let score = avgMic + rivalryBonus + momentumBonus + rand(8);
  if (segment.isMainEvent) score += 5;
  score = clamp(score);

  const highlights: string[] = [];
  if (score >= 80) highlights.push("Promo de l'année !");
  else if (score >= 60) highlights.push("Bonne promo");
  else highlights.push("Promo plate");

  return {
    segmentId: segment.id,
    type: segment.type,
    score: Math.round(score),
    highlights,
  };
}

export function simulateShow(save: GMSave): ShowResult {
  if (save.bookedShow.length === 0) {
    return {
      week: save.week,
      segments: [],
      overallRating: 0,
      fansGained: 0,
      moneyEarned: 0,
      moralChange: -5,
    };
  }

  const segmentResults: SegmentResult[] = save.bookedShow.map((seg) => {
    if (seg.type === "match_single" || seg.type === "match_tag") {
      return simulateMatchSegment(seg, save);
    }
    return simulatePromoSegment(seg, save);
  });

  // Weighted average: main event counts double
  let totalWeight = 0;
  let weightedScore = 0;
  for (let i = 0; i < segmentResults.length; i++) {
    const seg = save.bookedShow[i];
    const weight = seg.isMainEvent ? 2 : 1;
    weightedScore += segmentResults[i].score * weight;
    totalWeight += weight;
  }

  const overallRating = clamp(Math.round(weightedScore / totalWeight));

  // Fans / money / moral based on rating
  const ratingFactor = overallRating / 100;
  const fansGained = Math.round(save.fans * 0.02 * ratingFactor + rand(500));
  const moneyEarned = Math.round(20000 + 30000 * ratingFactor + rand(5000));
  const moralChange = overallRating >= 60 ? 5 : overallRating >= 40 ? 0 : -5;

  return {
    week: save.week,
    segments: segmentResults,
    overallRating,
    fansGained: Math.max(0, fansGained),
    moneyEarned: Math.max(5000, moneyEarned),
    moralChange,
  };
}

export function applyShowResults(save: GMSave, result: ShowResult): GMSave {
  const updatedRoster = save.roster.map((s) => {
    // Fatigue
    const didPerform = save.bookedShow.some((seg) => seg.participants.includes(s.id));
    let stamina = didPerform ? clamp(s.stamina - 15) : clamp(s.stamina + 10);

    // Momentum
    const won = result.segments.some((sr) => sr.winnerId === s.id);
    const lost = result.segments.some(
      (sr) => sr.winnerId && sr.winnerId !== s.id && save.bookedShow.find((b) => b.id === sr.segmentId)?.participants.includes(s.id)
    );
    let momentum = s.momentum + (won ? 3 : 0) + (lost ? -2 : 0);
    momentum = clamp(momentum, -20, 20);

    // Random injury (2% chance if performed)
    const injured = didPerform && !s.injured && Math.random() < 0.02;

    return {
      ...s,
      stamina,
      momentum,
      injured: s.injured || injured,
      injuryWeeksLeft: injured ? 3 : s.injuryWeeksLeft > 0 ? s.injuryWeeksLeft - 1 : 0,
    };
  });

  // Update rivalry intensity
  const updatedRivalries = save.rivalries.map((r) => {
    const wasBooked = save.bookedShow.some(
      (seg) => seg.rivalryId === r.id || (seg.participants.includes(r.superstarAId) && seg.participants.includes(r.superstarBId))
    );
    return wasBooked ? { ...r, intensity: clamp(r.intensity + 10) } : r;
  });

  const weeklyCost = save.roster
    .filter((s) => s.brand === save.brand)
    .reduce((sum, s) => sum + s.salary, 0);

  return {
    ...save,
    week: save.week + 1,
    fans: save.fans + result.fansGained,
    budget: save.budget - weeklyCost + result.moneyEarned,
    brandReputation: clamp(save.brandReputation + (result.overallRating >= 70 ? 2 : result.overallRating < 40 ? -2 : 0)),
    roster: updatedRoster,
    rivalries: updatedRivalries,
    bookedShow: [],
    showHistory: [...save.showHistory, result],
  };
}

export { uuid };
