/**
 * User controller
 * ユーザーに関するAPIエンドポイント
 */
import { Response, NextFunction } from "express";

import { AuthenticatedRequest } from "@/middlewares/auth";

/**
 * 現在のユーザー情報を取得
 * GET /api/v1/user
 */
export async function getCurrentUserController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}
