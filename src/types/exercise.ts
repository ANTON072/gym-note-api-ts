export const BodyPart = {
  CHEST: 0,
  BACK: 1,
  SHOULDERS: 2,
  ARMS: 3,
  LEGS: 4,
  CORE: 5,
} as const;

export type BodyPart = (typeof BodyPart)[keyof typeof BodyPart];
