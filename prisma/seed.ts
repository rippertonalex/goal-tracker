import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ⚠️  WARNING: This seed DELETES ALL DATA including daily logs and completions!
  // Only run this on a fresh database or if you're okay losing all tracking history.
  // For updating existing systems/goals, use the admin actions or DB view instead.

  const existingLogs = await prisma.dailyLog.count();
  if (existingLogs > 0) {
    console.log(
      `\n⚠️  WARNING: Found ${existingLogs} daily logs in the database.`
    );
    console.log(
      "   Running seed will DELETE ALL completion history!"
    );
    console.log(
      "   To proceed anyway, run with: FORCE_SEED=1 npx prisma db seed\n"
    );
    if (!process.env.FORCE_SEED) {
      console.log("   Aborting seed. No data was changed.");
      return;
    }
    console.log("   FORCE_SEED=1 detected. Proceeding with destructive seed...\n");
  }

  // Clear existing data
  await prisma.systemCompletion.deleteMany();
  await prisma.dailyLog.deleteMany();
  await prisma.system.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.theme.deleteMany();

  console.log("🧹 Cleared existing data\n");

  // ─── Theme 1: Financial Independence ───
  await prisma.theme.create({
    data: {
      number: 1,
      title: "Financial Independence & Affluence",
      emoji: "💰",
      color: "emerald",
      identity:
        "I'm smart and talented and I'm going to live my life in the 1% and not get stuck in the permanent underclass created by AI. This will allow me to have the family and life of my dreams.",
      goals: {
        create: [
          {
            title: "$500k net worth by 27½",
            deadline: new Date("2027-03-12"),
            currentValue: 340000,
            targetValue: 500000,
            unit: "$",
            notes:
              "I need to make $50k more a year to be able to save $2k+/week to hit this goal.",
            systems: {
              create: [
                {
                  description: "Continue saving $1k/week",
                  frequency: "weekly",
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log("💰 Theme 1: Financial Independence & Affluence");

  // ─── Theme 2: Health ───
  await prisma.theme.create({
    data: {
      number: 2,
      title: "Get in the Best Health of My Life",
      emoji: "💪",
      color: "blue",
      identity:
        "My health is the only thing I really have. It is so important and having issues last year made me realize how important it is. Having elite health and athletic performance keeps my options open for big wave surfing, spearfishing, mountaineering, ultra marathons, etc. It's also crucial for my longevity.",
      goals: {
        create: [
          {
            title:
              "Increase VO2 max to 50 for more than 3 workouts in a row",
            deadline: new Date("2026-04-17"),
            systems: {
              create: [
                {
                  description:
                    "Have 2 recordable events on your Apple Watch per week and plan accordingly",
                  frequency: "weekly",
                  targetCount: 2,
                },
              ],
            },
          },
          {
            title:
              "Weight lifting 3x per week with stretching after or before bed",
            deadline: new Date("2026-04-17"),
            systems: {
              create: [
                {
                  description: "Gym 3x per week recorded in Strong app",
                  frequency: "weekly",
                  targetCount: 3,
                },
              ],
            },
          },
          {
            title: "Reach a VO2 max of 55 before September",
            deadline: new Date("2026-08-31"),
          },
        ],
      },
    },
  });
  console.log("💪 Theme 2: Get in the Best Health of My Life");

  // ─── Theme 3: Better Partner ───
  await prisma.theme.create({
    data: {
      number: 3,
      title: "Becoming a Better Future Partner",
      emoji: "❤️",
      color: "rose",
      identity:
        "I'm a catch. I'm motivated, good looking, funny, smart, etc. I deserve to be with a wonderful woman. Choosing your life partner is the most important decision of your life so don't rush it and think it through and don't settle.",
      goals: {
        create: [
          {
            title: "Try CBT",
            deadline: new Date("2026-02-28"),
          },
          {
            title: "Keep a dream journal daily",
            deadline: new Date("2026-02-26"),
            systems: {
              create: [
                {
                  description:
                    "Journal entry completed and journal is visible where you wake up",
                  frequency: "daily",
                },
              ],
            },
          },
          {
            title: "Improve sexual stamina",
            deadline: new Date("2026-04-17"),
            systems: {
              create: [
                {
                  description:
                    "Yesterday I optimized sexual health habits",
                  frequency: "daily",
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log("❤️  Theme 3: Becoming a Better Future Partner");

  // ─── Theme 4: Outdoor Sports ───
  await prisma.theme.create({
    data: {
      number: 4,
      title: "Continue Developing My Passion for Outdoor Sports",
      emoji: "🏔️",
      color: "amber",
      identity: "",
      goals: {
        create: [
          {
            title:
              "Improve turns & barrel riding in surfing — get a shot of yourself doing a turn or barrel",
            deadline: new Date("2026-04-17"),
            systems: {
              create: [
                {
                  description:
                    "Watch 30 min/week of YouTube tutorials for surfing",
                  frequency: "weekly",
                },
                {
                  description:
                    "Surf more aggressively like you aren't scared of falling",
                  frequency: "weekly",
                },
                {
                  description: "Surf a minimum of 3x/week",
                  frequency: "weekly",
                  targetCount: 3,
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log("🏔️  Theme 4: Outdoor Sports");

  // ─── Theme 5: Learning & Exploring ───
  await prisma.theme.create({
    data: {
      number: 5,
      title: "Continue Learning & Exploring New Things",
      emoji: "🌍",
      color: "purple",
      identity:
        "I'm still a young man and that means I'm still on the explore side of things in that exploit/explore tradeoff. Try more new things and see what sticks.",
      goals: {
        create: [
          {
            title: "Practice Spanish for 3 hr/week",
            deadline: new Date("2026-04-17"),
            systems: {
              create: [
                {
                  description: "Watch one Spanish show per week",
                  frequency: "weekly",
                },
              ],
            },
          },
          {
            title: "Try a new martial art",
            deadline: new Date("2026-02-28"),
            systems: {
              create: [
                {
                  description: "Go to Buff Muay Thai",
                  frequency: "one_time",
                  deadline: new Date("2026-02-28"),
                },
              ],
            },
          },
          {
            title: "Reduce my anxiety around public speaking",
            systems: {
              create: [
                {
                  description: "Tell one story per day to someone",
                  frequency: "daily",
                },
                {
                  description: "Write a toast for my sister's wedding",
                  frequency: "one_time",
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log("🌍  Theme 5: Learning & Exploring");

  console.log("\n✅ Seed complete! 5 themes with goals and systems created.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
