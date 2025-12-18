import z from "zod";

export const exerciseSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  bodyPart: z.number().int().min(0).max(5).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const exerciseRequestSchema = exerciseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Exercise = z.infer<typeof exerciseSchema>;
export type ExerciseRequest = z.infer<typeof exerciseRequestSchema>;
