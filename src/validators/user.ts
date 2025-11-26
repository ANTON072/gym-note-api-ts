import z from "zod";

export const userSchema = z.object({
  id: z.string(),
  firebaseUid: z.string(),
  email: z.email().nullable(),
  name: z.string().nullable(),
  imageUrl: z.url().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof userSchema>;
