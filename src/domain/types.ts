export type Alignment = "face" | "heel" | "neutral";
export type Style = "powerhouse" | "highflyer" | "technicien" | "brawler";
export type RivalryType = "trahison" | "title_chase" | "respect" | "revenge";

export interface Superstar {
  id: string;
  name: string;
  popularity: number; // 0–100
  inRing: number;     // 0–100
  mic: number;        // 0–100
  stamina: number;    // 0–100 (current fatigue: 100 = fresh)
  alignment: Alignment;
  style: Style;
  momentum: number;   // -20 to +20
  injured: boolean;
  injuryWeeksLeft: number;
  contract: number;   // weeks remaining
  salary: number;     // per week
  brand: "raw" | "smackdown" | "free_agent";
  titleHolder: string | null; // title id or null
}

export interface Title {
  id: string;
  name: string;
  holderId: string | null;
  prestige: number; // 0–100
}

export interface Rivalry {
  id: string;
  superstarAId: string;
  superstarBId: string;
  intensity: number;  // 0–100
  chemistry: number;  // 0–100 (match quality bonus)
  type: RivalryType;
  weekStarted: number;
  active: boolean;
}

export type SegmentType = "match_single" | "match_tag" | "promo" | "angle" | "interview";

export interface BookedSegment {
  id: string;
  type: SegmentType;
  participants: string[]; // superstar ids
  titleId?: string;       // if title match
  rivalryId?: string;
  isMainEvent: boolean;
  objective?: string;
}

export interface ShowResult {
  week: number;
  segments: SegmentResult[];
  overallRating: number;
  fansGained: number;
  moneyEarned: number;
  moralChange: number;
}

export interface SegmentResult {
  segmentId: string;
  type: SegmentType;
  score: number;
  winnerId?: string;
  highlights: string[];
}

export type PowerCardId =
  | "boost_rating"
  | "heal_injury"
  | "promo_x2"
  | "fan_surge"
  | "momentum_push";

export interface PowerCard {
  id: PowerCardId;
  name: string;
  description: string;
  cost: number;
  quantity: number;
}

export interface GMSave {
  id: string;
  gmName: string;
  brand: "raw" | "smackdown";
  week: number;
  budget: number;
  fans: number;
  brandReputation: number; // 0–100
  roster: Superstar[];
  titles: Title[];
  rivalries: Rivalry[];
  bookedShow: BookedSegment[];
  showHistory: ShowResult[];
  powerCards: PowerCard[];
  createdAt: string;
}
