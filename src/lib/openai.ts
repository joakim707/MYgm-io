import OpenAI from "openai";
import type { GMSave, Superstar } from "../domain/types";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// ─── 1. Génération de promo ───────────────────────────────────────────────────

export async function generatePromo(
  superstar: Superstar,
  rivalName?: string,
  context?: string
): Promise<string> {
  const alignment = superstar.alignment === "face" ? "babyface héroïque" : superstar.alignment === "heel" ? "heel arrogant et manipulateur" : "neutre mystérieux";
  const style = superstar.style === "powerhouse" ? "colosse intimidant" : superstar.style === "highflyer" ? "acrobate électrisant" : superstar.style === "technicien" ? "technicien précis" : "brawler brutal";

  const prompt = `Tu es un scénariste de catch professionnel. Écris une promo de catch courte (8-12 phrases) pour le personnage suivant :

Nom : ${superstar.name}
Profil : ${alignment}, style ${style}
Score mic : ${superstar.mic}/100
${rivalName ? `Rival principal : ${rivalName}` : ""}
${context ? `Contexte : ${context}` : ""}

La promo doit être en français, dramatique, dans le style WWE/AEW. Commence directement par le discours, sans introduction.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 400,
    temperature: 0.9,
  });

  return response.choices[0]?.message?.content ?? "Promo indisponible.";
}

// ─── 2. Recap de show ─────────────────────────────────────────────────────────

export async function generateShowRecap(save: GMSave): Promise<string> {
  const lastShow = save.showHistory[save.showHistory.length - 1];
  if (!lastShow) return "Aucun show à résumer.";

  const segmentsSummary = lastShow.segments
    .map((sr, i) => {
      const winner = sr.winnerId ? save.roster.find((s) => s.id === sr.winnerId)?.name : null;
      return `- Segment ${i + 1} (${sr.type}) : score ${sr.score}/100${winner ? `, victoire de ${winner}` : ""}. ${sr.highlights.join(", ")}`;
    })
    .join("\n");

  const prompt = `Tu es un journaliste spécialisé catch. Écris un article de presse court (10-15 lignes) résumant ce show de catch :

Brand : ${save.brand.toUpperCase()}
GM : ${save.gmName}
Semaine : ${lastShow.week}
Rating global : ${lastShow.overallRating}/100
Fans gagnés : +${lastShow.fansGained.toLocaleString()}
Recettes : +${lastShow.moneyEarned.toLocaleString()}$

Résultats :
${segmentsSummary}

Écris en français dans un style dramatique et passionné. Commence par un titre accrocheur.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 500,
    temperature: 0.8,
  });

  return response.choices[0]?.message?.content ?? "Recap indisponible.";
}

// ─── 3. Suggestions de booking ───────────────────────────────────────────────

export interface BookingSuggestion {
  type: "match_single" | "match_tag" | "promo" | "angle";
  participants: string[];
  reason: string;
  isMainEvent: boolean;
}

export async function generateBookingSuggestions(save: GMSave): Promise<BookingSuggestion[]> {
  const roster = save.roster
    .filter((s) => s.brand === save.brand && !s.injured)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 10);

  const rivalriesText = save.rivalries
    .filter((r) => r.active)
    .map((r) => {
      const a = save.roster.find((s) => s.id === r.superstarAId)?.name;
      const b = save.roster.find((s) => s.id === r.superstarBId)?.name;
      return `${a} vs ${b} (intensité ${r.intensity}, type: ${r.type})`;
    })
    .join(", ");

  const rosterText = roster
    .map((s) => `${s.name} (pop ${s.popularity}, momentum ${s.momentum > 0 ? "+" : ""}${s.momentum}, ${s.alignment})`)
    .join(", ");

  const prompt = `Tu es un GM de catch expérimenté. Suggère 4 segments pour le prochain show basé sur ces informations :

Brand : ${save.brand.toUpperCase()} | Semaine : ${save.week}
Budget : ${save.budget.toLocaleString()}$
Roster disponible : ${rosterText}
Rivalités actives : ${rivalriesText || "Aucune"}

Réponds UNIQUEMENT avec un JSON valide, sans markdown, sans backtick, exactement ce format :
[
  {"type":"match_single","participants":["Nom A","Nom B"],"reason":"raison courte","isMainEvent":true},
  {"type":"promo","participants":["Nom C"],"reason":"raison courte","isMainEvent":false},
  {"type":"match_single","participants":["Nom D","Nom E"],"reason":"raison courte","isMainEvent":false},
  {"type":"angle","participants":["Nom F","Nom G"],"reason":"raison courte","isMainEvent":false}
]

Utilise UNIQUEMENT les noms exacts du roster fourni.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 600,
    temperature: 0.7,
  });

  try {
    const raw = response.choices[0]?.message?.content ?? "[]";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned) as BookingSuggestion[];
    // Map participant names to IDs
    return parsed.map((s) => ({
      ...s,
      participants: s.participants
        .map((name) => save.roster.find((r) => r.name === name)?.id)
        .filter(Boolean) as string[],
    }));
  } catch {
    return [];
  }
}

// ─── 4. Génération d'affiche (DALL-E) ────────────────────────────────────────

export async function generateShowPoster(save: GMSave): Promise<string> {
  const lastShow = save.showHistory[save.showHistory.length - 1];
  const rating = lastShow?.overallRating ?? 50;
  const mood = rating >= 70 ? "triumphant and epic" : rating >= 50 ? "intense and dramatic" : "chaotic and rough";
  const brandColor = save.brand === "raw" ? "red and black" : "blue and white";

  const prompt = `Professional wrestling event poster for "${save.brand.toUpperCase()} WEEK ${save.week}" by GM "${save.gmName}". Style: ${mood}, ${brandColor} color scheme, dramatic lighting, wrestling ring silhouette, crowd in background, bold championship belt graphic, retro 90s WWE poster aesthetic. High contrast, cinematic composition.`;

  const response = await client.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
  });

  return response.data?.[0]?.url ?? "";
}
