/**
 * Hono用の型定義
 * 認証済みルートで使用する環境型
 */
import type { User } from "@/schemas/user";
import type { admin } from "@/config/firebase";

/**
 * 認証済みルート用の環境型定義
 * c.get("user") で User オブジェクトを取得可能
 */
export type AuthEnv = {
  Variables: {
    user: User;
    decodedToken: admin.auth.DecodedIdToken;
  };
};
