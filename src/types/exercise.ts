export const BodyPart = {
  CHEST: 0,
  BACK: 1,
  SHOULDERS: 2,
  ARMS: 3,
  LEGS: 4,
  CORE: 5,
} as const;

export type BodyPart = (typeof BodyPart)[keyof typeof BodyPart];

/**
 * 種目タイプ
 * 0: 筋力トレーニング
 * 1: 有酸素運動
 */
export const ExerciseType = {
  STRENGTH: 0,
  CARDIO: 1,
} as const;

export type ExerciseType = (typeof ExerciseType)[keyof typeof ExerciseType];
