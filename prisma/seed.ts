/**
 * シードデータ
 * 実行: npm run prisma:seed
 *
 * - プリセット種目: 全ユーザー共通の定番種目（userId: null, isPreset: true）
 */
import { PrismaClient } from "@prisma/client";
import { presetExerciseSeeds } from "./data/exercises";

const prisma = new PrismaClient();

/**
 * プリセット種目を登録
 * 全ユーザー共通で使用できる定番種目
 */
async function seedPresetExercises() {
  console.log("Seeding preset exercises...");

  for (const exercise of presetExerciseSeeds) {
    // プリセット種目は name で検索して upsert
    const existing = await prisma.exercise.findFirst({
      where: {
        isPreset: true,
        name: exercise.name,
      },
    });

    if (existing) {
      await prisma.exercise.update({
        where: { id: existing.id },
        data: exercise,
      });
    } else {
      await prisma.exercise.create({
        data: {
          ...exercise,
          isPreset: true,
          userId: null,
        },
      });
    }
  }

  console.log(`Created/Updated ${presetExerciseSeeds.length} preset exercises`);
}

async function main() {
  console.log("Seeding database...");

  // プリセット種目を登録
  await seedPresetExercises();

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
