import { v4 as uuid } from "uuid";
import type { Superstar, Title, PowerCard } from "./types";

export function seedRoster(): Superstar[] {
  const make = (
    name: string,
    pop: number,
    ring: number,
    mic: number,
    alignment: Superstar["alignment"],
    style: Superstar["style"],
    salary: number
  ): Superstar => ({
    id: uuid(),
    name,
    popularity: pop,
    inRing: ring,
    mic,
    stamina: 100,
    alignment,
    style,
    momentum: 0,
    injured: false,
    injuryWeeksLeft: 0,
    contract: 52,
    salary,
    brand: "free_agent",
    titleHolder: null,
  });

  return [
    // Top tier
    make("The Apex", 90, 88, 85, "face", "technicien", 12000),
    make("Shadowbane", 88, 90, 70, "heel", "powerhouse", 11000),
    make("El Relámpago", 82, 95, 65, "face", "highflyer", 9000),
    make("Iron Cross", 85, 80, 92, "heel", "brawler", 10000),
    make("The Phoenix", 80, 85, 88, "face", "technicien", 9500),
    make("Viper King", 78, 83, 75, "heel", "powerhouse", 8500),

    // Mid tier
    make("Storm Rider", 70, 78, 60, "face", "highflyer", 7000),
    make("Dark Prophet", 68, 72, 82, "heel", "brawler", 6500),
    make("The Machine", 65, 85, 45, "face", "powerhouse", 6000),
    make("Neon Drifter", 63, 77, 70, "neutral", "technicien", 5500),
    make("Bloodhound", 62, 74, 58, "heel", "brawler", 5000),
    make("Golden Rush", 60, 70, 75, "face", "highflyer", 5000),

    // Lower tier
    make("The Stampede", 50, 65, 40, "face", "powerhouse", 4000),
    make("Crow", 48, 68, 55, "heel", "technicien", 3800),
    make("Flash Gordon", 45, 72, 48, "face", "highflyer", 3500),
    make("Brimstone", 44, 60, 62, "heel", "brawler", 3200),
    make("Lucky Seven", 42, 58, 65, "face", "brawler", 3000),
    make("The Phantom", 40, 62, 50, "neutral", "technicien", 2800),
    make("Rex Thunder", 38, 55, 45, "heel", "powerhouse", 2500),
    make("Nova", 35, 68, 40, "face", "highflyer", 2500),
  ];
}

export function seedTitles(): Title[] {
  return [
    { id: uuid(), name: "World Heavyweight Championship", holderId: null, prestige: 90 },
    { id: uuid(), name: "Intercontinental Championship", holderId: null, prestige: 65 },
    { id: uuid(), name: "Tag Team Championship", holderId: null, prestige: 55 },
  ];
}

export function seedPowerCards(): PowerCard[] {
  return [
    { id: "boost_rating", name: "Boost Rating", description: "+15 au rating du prochain show", cost: 3000, quantity: 2 },
    { id: "heal_injury", name: "Heal Injury", description: "Guérit immédiatement une blessure", cost: 5000, quantity: 1 },
    { id: "promo_x2", name: "Promo x2", description: "Double le score de la prochaine promo", cost: 2000, quantity: 3 },
    { id: "fan_surge", name: "Fan Surge", description: "+5000 fans après le show", cost: 4000, quantity: 1 },
    { id: "momentum_push", name: "Momentum Push", description: "+10 momentum à une superstar", cost: 1500, quantity: 3 },
  ];
}
