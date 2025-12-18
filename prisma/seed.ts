/**
 * シードデータ
 * 実行: npm run prisma:seed
 *
 * - プリセット種目: 全ユーザー共通の定番種目（userId: null, isPreset: true）
 * - 開発用ユーザー: 開発環境用のテストユーザー
 */
import { PrismaClient } from "@prisma/client";
import { presetExerciseSeeds } from "./data/exercises";

const prisma = new PrismaClient();

// 開発用ユーザーのFirebase UID（Firebase Emulator に存在するユーザー）
const DEV_USER_FIREBASE_UID = "Dky4etCU3AsMoz2qaQgpfGuvA9Na";

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

/**
 * 開発用ユーザーを作成
 */
async function seedDevUser() {
  console.log("Seeding dev user...");

  const user = await prisma.user.upsert({
    where: { firebaseUid: DEV_USER_FIREBASE_UID },
    update: {},
    create: {
      firebaseUid: DEV_USER_FIREBASE_UID,
      email: "bdbkx286@gmail.com",
      name: "test user",
    },
  });

  console.log(`Dev user created/found: ${user.id}`);
  return user;
}

async function main() {
  console.log("Seeding database...");

  // プリセット種目を登録
  await seedPresetExercises();

  // 開発用ユーザーを作成
  await seedDevUser();

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
