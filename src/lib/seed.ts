import type { Frequency } from "./types";

export type SeedRoom = {
  name: string;
  tasks: { title: string; frequency: Frequency; notes?: string }[];
};

/**
 * Default starter content based on the Sitting Room cleaning spec.
 * Inserted for a household by the "Use sample tasks" action on the rooms page.
 */
export const SAMPLE_ROOMS: SeedRoom[] = [
  {
    name: "Sitting Room",
    tasks: [
      { title: "Replace and fluff pillows", frequency: "daily" },
      {
        title: "Clear plates, cutlery, clothes from cushions/radiator/doors",
        frequency: "daily",
      },
      { title: "Arrange photos on the TV stand", frequency: "daily" },
      { title: "Turn off the sidelight", frequency: "daily" },
      { title: "Turn off the TV", frequency: "daily" },
      { title: "Put away electronics", frequency: "daily" },
      { title: "Close the blinds", frequency: "daily" },
      { title: "Dust off the couch", frequency: "daily" },

      { title: "Hoover the floors", frequency: "weekly" },
      { title: "Hoover the couch", frequency: "weekly" },
      {
        title: "Clean the TV stand",
        frequency: "weekly",
        notes: "Wet wipe, then wipe with a clean dry flannel.",
      },
      { title: "Replace flowers", frequency: "weekly" },
      { title: "Add water to flower vases", frequency: "weekly" },
      {
        title: "Clean top of black stool",
        frequency: "weekly",
        notes: "Wet wipe, then wipe with a clean dry flannel.",
      },
      { title: "Dust flower vases", frequency: "weekly" },

      { title: "Wipe blinds with a dry feather duster", frequency: "monthly" },
      {
        title: "Wipe edges of windowsill",
        frequency: "monthly",
        notes: "Wet wipe, then wipe with a clean dry flannel.",
      },
      {
        title: "Clean windows (inside)",
        frequency: "monthly",
        notes:
          "Wet wipe, then wipe with a clean dry flannel, finishing with window cleaning spray.",
      },
      {
        title: "Check couches for stains; spot clean",
        frequency: "monthly",
      },

      {
        title: "Wipe blinds (deep)",
        frequency: "quarterly",
        notes: "Wet wipe, then wipe with a clean dry flannel.",
      },
      { title: "Wash carpets with carpet washer", frequency: "quarterly" },
      {
        title: "Clean all surfaces",
        frequency: "quarterly",
        notes: "Wet wipe, then wipe with a clean dry flannel.",
      },
    ],
  },
  {
    name: "Kitchen",
    tasks: [
      { title: "Wash up after meals", frequency: "daily" },
      { title: "Wipe counters", frequency: "daily" },
      { title: "Empty the bin if full", frequency: "daily" },
      { title: "Mop the floor", frequency: "weekly" },
      { title: "Clean the oven", frequency: "monthly" },
      { title: "Defrost & deep-clean the fridge", frequency: "quarterly" },
    ],
  },
  {
    name: "Bathroom",
    tasks: [
      { title: "Squeegee the shower", frequency: "daily" },
      { title: "Wipe the sink", frequency: "weekly" },
      { title: "Clean the toilet", frequency: "weekly" },
      { title: "Mop the floor", frequency: "weekly" },
      { title: "Descale taps & shower head", frequency: "monthly" },
      { title: "Deep-clean grout", frequency: "quarterly" },
    ],
  },
];
