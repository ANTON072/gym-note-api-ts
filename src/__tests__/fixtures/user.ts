/**
 * ユーザーテスト用のモックデータ
 */

/** テスト用 Firebase UID */
export const TEST_FIREBASE_UID = "firebase123";

/** モックユーザー */
export const mockUser = {
  id: "cuid123",
  firebaseUid: TEST_FIREBASE_UID,
  email: "test@example.com",
  name: "テストユーザー",
  imageUrl: "https://example.com/image.jpg",
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
};

/** モック Firebase ユーザー */
export const mockFirebaseUser = {
  uid: TEST_FIREBASE_UID,
  email: "test@example.com",
  displayName: "テストユーザー",
  photoURL: "https://example.com/image.jpg",
};

/** モック DecodedIdToken */
export const mockDecodedToken = {
  uid: TEST_FIREBASE_UID,
};
