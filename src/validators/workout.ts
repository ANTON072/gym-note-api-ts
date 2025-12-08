import z from "zod";
import { exerciseSchema, exerciseRequestSchema } from "./exercise";

export const workoutSetSchema = z.object({
  id: z.string(),
  weight: z.number().int().min(0).nullable(),
  reps: z.number().int().min(0).nullable(),
});

export const workoutSetRequestSchema = workoutSetSchema.omit({ id: true });

export const workoutExerciseSchema = z.object({
  id: z.string(),
  orderIndex: z.number().int().min(0),
  exercise: exerciseSchema.omit({ createdAt: true, updatedAt: true }),
  workoutSets: z.array(workoutSetSchema),
});

/**
 * エクササイズ指定スキーマ
 * - id のみ: 既存エクササイズを使用
 * - name, bodyPart, laterality: 新規エクササイズを作成
 */
const existingExerciseSchema = z.object({ id: z.string() });
const newExerciseSchema = exerciseRequestSchema;

export const workoutExerciseRequestSchema = z.object({
  exercise: z.union([existingExerciseSchema, newExerciseSchema]),
  orderIndex: z.number().int().min(0),
  workoutSets: z.array(workoutSetRequestSchema),
});

export const workoutSchema = z.object({
  id: z.string(),
  performedStartAt: z.coerce.date(),
  performedEndAt: z.coerce.date().nullable(),
  place: z.string().nullable(),
  note: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  workoutExercises: z.array(workoutExerciseSchema),
});

export const workoutRequestSchema = workoutSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    workoutExercises: true,
  })
  .extend({
    workoutExercises: z.array(workoutExerciseRequestSchema),
  });

export type Workout = z.infer<typeof workoutSchema>;
export type WorkoutRequest = z.infer<typeof workoutRequestSchema>;
export type WorkoutExercise = z.infer<typeof workoutExerciseSchema>;
export type WorkoutExerciseRequest = z.infer<
  typeof workoutExerciseRequestSchema
>;
export type WorkoutSet = z.infer<typeof workoutSetSchema>;
export type WorkoutSetRequest = z.infer<typeof workoutSetRequestSchema>;
