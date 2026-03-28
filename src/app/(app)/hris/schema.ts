import { z } from "zod";

export const roleRankSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
});

export type RoleRankFormData = z.infer<typeof roleRankSchema>;
