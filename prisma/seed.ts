/**
 * 開発用シードデータ
 * 実行: npm run prisma:seed
 */
import { PrismaClient } from "@prisma/client";
import { exerciseSeeds } from "./data/exercises";

const prisma = new PrismaClient();

// 開発用ユーザーのFirebase UID（Firebase Emulator に存在するユーザー）
const DEV_USER_FIREBASE_UID = "Dky4etCU3AsMoz2qaQgpfGuvA9Na";

async function main() {
  console.log("Seeding database...");

  // 開発用ユーザーを作成（存在しない場合）
  const user = await prisma.user.upsert({
    where: { firebaseUid: DEV_USER_FIREBASE_UID },
    update: {},
    create: {
      firebaseUid: DEV_USER_FIREBASE_UID,
      email: "bdbkx286@gmail.com",
      name: "test user",
    },
  });

  console.log(`User created/found: ${user.id}`);

  // エクササイズを作成
  for (const exercise of exerciseSeeds) {
    await prisma.exercise.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name: exercise.name,
        },
      },
      update: {},
      create: {
        userId: user.id,
        ...exercise,
      },
    });
  }

  console.log(`Created ${exerciseSeeds.length} exercises`);
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
