import { t_TeamsObj } from "./types";

export const teams = [
  { num: 33, name: "Killer Bees" },
  { num: 47, name: "FIRST 47" },
  { num: 67, name: "HAM" },
  { num: 71, name: "Blue Alliance" },
  { num: 118, name: "Robonauts" },
  { num: 148, name: "Robodox" },
  { num: 245, name: "Adambots" },
  { num: 254, name: "Cheesy Poofs" },
  { num: 321, name: "Robolancers" },
  { num: 341, name: "Bears" },
  { num: 359, name: "The Hawaiian Kids" },
  { num: 469, name: "Pioneers" },
  { num: 610, name: "The Brittany Spears Bots" },
  { num: 968, name: "Technically Challenged" },
  { num: 971, name: "Spartan Robotics" },
  { num: 1114, name: "Opiate" },
  { num: 1323, name: "MadTown Robotics" },
  { num: 1619, name: "Barking Mad Robotics" },
  { num: 1678, name: "Citrus Circuits" },
  { num: 1960, name: "Brumation" },
  { num: 2052, name: "SA Robotics" },
  { num: 2056, name: "Recycle" },
  { num: 3749, name: "OPTIX" },
  { num: 4414, name: "HighTide" },
  { num: 4481, name: "Rembrandts" },
  { num: 5419, name: "The Funky Monkeys" },
  { num: 5635, name: "Gear Strikers" },
  { num: 5940, name: "Gear Hungry" },
  { num: 5951, name: "The Robotamus" },
  { num: 6995, name: "Nomad" },
  { num: 9414, name: "JackBots" },
  { num: 9419, name: "Vulcan" }
] as t_TeamsObj[];

export function getRandomTeam(exclude?: t_TeamsObj[]) {
  const randomIndex = Math.floor(Math.random() * teams.length - 1);
  const randomTeam = teams[randomIndex];

  if (exclude?.some((item) => item.num === randomTeam.num))
    return getRandomTeam(exclude);

  return randomTeam;
}
