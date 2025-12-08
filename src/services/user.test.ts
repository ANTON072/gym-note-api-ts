/**
 * ユーザーサービスのテスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

import { prisma } from "@/config/database";
import { admin } from "@/config/firebase";
import {
  TEST_FIREBASE_UID,
  mockUser,
  mockFirebaseUser,
} from "@/__tests__/fixtures/user";

import { findOrCreateUser } from "./user";

// Prismaのモック
vi.mock("../config/database", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Firebase Adminのモック
vi.mock("../config/firebase", () => ({
  admin: {
    auth: vi.fn(() => ({
      getUser: vi.fn(),
    })),
  },
}));

describe("ユーザーサービス", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findOrCreateUser", () => {
    it("既存ユーザーが見つかった場合、そのユーザーを返す", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await findOrCreateUser(TEST_FIREBASE_UID);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { firebaseUid: TEST_FIREBASE_UID },
      });
      expect(result).toEqual(mockUser);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("ユーザーが存在しない場合、Firebaseから情報を取得して新規作成する", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

      vi.mocked(admin.auth).mockReturnValue({
        getUser: vi.fn().mockResolvedValue(mockFirebaseUser),
      } as unknown as admin.auth.Auth);

      const result = await findOrCreateUser(TEST_FIREBASE_UID);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { firebaseUid: TEST_FIREBASE_UID },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          firebaseUid: TEST_FIREBASE_UID,
          email: mockFirebaseUser.email,
          name: mockFirebaseUser.displayName,
          imageUrl: mockFirebaseUser.photoURL,
        },
      });
      expect(result).toEqual(mockUser);
    });
  });
});
