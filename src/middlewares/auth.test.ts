/**
 * 認証ミドルウェアのテスト
 * エラーケースごとに適切なステータスコードが返されることを検証する
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

import { authMiddleware, AuthenticatedRequest } from "./auth";
import { AppError } from "./errorHandler";

// Firebase Adminのモック
vi.mock("../config/firebase", () => ({
  admin: {
    auth: vi.fn(() => ({
      verifyIdToken: vi.fn(),
    })),
  },
  initializeFirebase: vi.fn(),
}));

// findOrCreateUserのモック
vi.mock("../services/user", () => ({
  findOrCreateUser: vi.fn(),
}));

import { admin } from "@/config/firebase";
import { findOrCreateUser } from "@/services/user";

describe("認証ミドルウェア", () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {
      headers: {},
    };
    mockRes = {};
    mockNext = vi.fn();
  });

  describe("401 UNAUTHORIZED を返すケース", () => {
    it("Authorizationヘッダーがない場合", async () => {
      await authMiddleware(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: "UNAUTHORIZED",
        })
      );
    });

    it("Bearer形式でない場合", async () => {
      mockReq.headers = { authorization: "Basic token123" };

      await authMiddleware(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: "UNAUTHORIZED",
        })
      );
    });

    it("Firebaseトークン検証が失敗した場合", async () => {
      mockReq.headers = { authorization: "Bearer invalid_token" };

      vi.mocked(admin.auth).mockReturnValue({
        verifyIdToken: vi.fn().mockRejectedValue(new Error("Invalid token")),
      } as unknown as ReturnType<typeof admin.auth>);

      await authMiddleware(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: "UNAUTHORIZED",
        })
      );
    });
  });

  describe("500 INTERNAL_ERROR を返すケース", () => {
    it("DB接続エラーの場合", async () => {
      mockReq.headers = { authorization: "Bearer valid_token" };

      const mockDecodedToken = { uid: "firebase123" };
      vi.mocked(admin.auth).mockReturnValue({
        verifyIdToken: vi.fn().mockResolvedValue(mockDecodedToken),
      } as unknown as ReturnType<typeof admin.auth>);

      // PrismaClientInitializationError をシミュレート
      const prismaError = new Prisma.PrismaClientInitializationError(
        "Can't reach database server",
        "2.0.0",
        "P1001"
      );
      vi.mocked(findOrCreateUser).mockRejectedValue(prismaError);

      await authMiddleware(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          code: "INTERNAL_ERROR",
        })
      );
    });

    it("予期しないエラーの場合", async () => {
      mockReq.headers = { authorization: "Bearer valid_token" };

      const mockDecodedToken = { uid: "firebase123" };
      vi.mocked(admin.auth).mockReturnValue({
        verifyIdToken: vi.fn().mockResolvedValue(mockDecodedToken),
      } as unknown as ReturnType<typeof admin.auth>);

      vi.mocked(findOrCreateUser).mockRejectedValue(
        new Error("Unexpected error")
      );

      await authMiddleware(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          code: "INTERNAL_ERROR",
        })
      );
    });
  });

  describe("正常ケース", () => {
    it("認証成功時はnext()が呼ばれ、リクエストにユーザー情報が追加される", async () => {
      mockReq.headers = { authorization: "Bearer valid_token" };

      const mockDecodedToken = { uid: "firebase123" };
      vi.mocked(admin.auth).mockReturnValue({
        verifyIdToken: vi.fn().mockResolvedValue(mockDecodedToken),
      } as unknown as ReturnType<typeof admin.auth>);

      const mockUser = {
        id: "cuid123",
        firebaseUid: "firebase123",
        email: "test@example.com",
        name: "テストユーザー",
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(findOrCreateUser).mockResolvedValue(mockUser);

      await authMiddleware(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.decodedToken).toEqual(mockDecodedToken);
      expect(mockReq.user).toEqual(mockUser);
    });
  });
});
