/**
 * User Service
 * Userの取得、作成に関するビジネスロジック
 */
import { prisma } from "@/config/database";
import { admin } from "@/config/firebase";

import type { User } from "@prisma/client";

/**
 * Firebase UIDでユーザーを検索し、存在しなければFirebaseから情報を取得して作成する
 * @param firebaseUid - Firebase UID
 * @returns ユーザーオブジェクト
 */
export async function findOrCreateUser(firebaseUid: string): Promise<User> {
  let user = await prisma.user.findUnique({
    where: { firebaseUid },
  });

  if (!user) {
    // Firebaseからユーザー情報を取得
    const firebaseUser = await admin.auth().getUser(firebaseUid);

    user = await prisma.user.create({
      data: {
        firebaseUid,
        email: firebaseUser.email ?? null,
        name: firebaseUser.displayName || firebaseUser.email || "Unknown",
        imageUrl: firebaseUser.photoURL || null,
      },
    });
  }

  return user;
}
