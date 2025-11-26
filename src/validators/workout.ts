import z from "zod";
import { exerciseSchema } from "./exercise";

export const workoutSetSchema = z.object({
  id: z.string(),
  weight: z.number().min(0).nullable(),
  reps: z.number().int().min(0).nullable(),
});

export const workoutExerciseSchema = z.object({
  id: z.string(),
  orderIndex: z.number().int().min(0),
  exercise: exerciseSchema.omit({ createdAt: true, updatedAt: true }),
  workoutSets: z.array(workoutSetSchema),
});

export const workoutSchema = z.object({
  id: z.string(),
  performedStartAt: z.date(),
  performedEndAt: z.date().nullable(),
  place: z.string().nullable(),
  note: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  workoutExercises: z.array(workoutExerciseSchema),
});
