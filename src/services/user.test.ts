/**
 * ユーザーサービスのテスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { findOrCreateUser } from "./user";
import { prisma } from "../config/database";
import { admin } from "../config/firebase";

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
    const mockUser = {
      id: "cuid123",
      firebaseUid: "firebase123",
      email: "test@example.com",
      name: "テストユーザー",
      imageUrl: "https://example.com/image.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("既存ユーザーが見つかった場合、そのユーザーを返す", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await findOrCreateUser("firebase123");

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { firebaseUid: "firebase123" },
      });
      expect(result).toEqual(mockUser);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("ユーザーが存在しない場合、Firebaseから情報を取得して新規作成する", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

      const mockFirebaseUser = {
        uid: "firebase123",
        email: "test@example.com",
        displayName: "テストユーザー",
        photoURL: "https://example.com/image.jpg",
      };

      vi.mocked(admin.auth).mockReturnValue({
        getUser: vi.fn().mockResolvedValue(mockFirebaseUser),
      } as unknown as admin.auth.Auth);

      const result = await findOrCreateUser("firebase123");

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { firebaseUid: "firebase123" },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          firebaseUid: "firebase123",
          email: "test@example.com",
          name: "テストユーザー",
          imageUrl: "https://example.com/image.jpg",
        },
      });
      expect(result).toEqual(mockUser);
    });
  });
});
