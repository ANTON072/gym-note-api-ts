/**
 * Firebase Admin SDKの初期化
 * Firebase Authenticationを使用するための設定
 */
import * as admin from "firebase-admin";
import { config } from "./env";

/**
 * Firebase Admin SDKを初期化する
 * @returns Firebase Admin アプリインスタンス
 */
export function initializeFirebase(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0] as admin.app.App;
  }

  const { projectId, privateKey, clientEmail } = config.firebase;

  if (!projectId || !privateKey || !clientEmail) {
    console.warn("Firebase credentials not found. Running in test mode.");
    return admin.initializeApp();
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      privateKey,
      clientEmail,
    }),
  });
}

export { admin };
