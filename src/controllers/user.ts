/**
 * User controller
 * ユーザーに関するAPIエンドポイント
 */
import { Response, NextFunction } from "express";

import { AuthenticatedRequest } from "@/middlewares/auth";
import { findOrCreateUser } from "@/services/user";

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
    const firebaseUid = req.user!.uid;
    const user = await findOrCreateUser(firebaseUid);

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}
