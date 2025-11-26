export const BodyPart = {
  CHEST: 0,
  BACK: 1,
  SHOULDERS: 2,
  ARMS: 3,
  LEGS: 4,
  CORE: 5,
} as const;

export type BodyPart = (typeof BodyPart)[keyof typeof BodyPart];

export const Laterality = {
  BILATERAL: 0,
  UNILATERAL: 1,
} as const;

export type Laterality = (typeof Laterality)[keyof typeof Laterality];
