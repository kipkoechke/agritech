import { z } from "zod";

// User form schema for create
export const userSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(3, "Name must be at least 3 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  region_id: z.string().optional(),
  zone_id: z.string().optional(),
  role_id: z.string().min(1, "Role is required"),
  status: z.boolean(),
  phone: z.string().optional(),
});

// User form schema for update (all fields optional)
export const updateUserSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  region_id: z.string().optional(),
  zone_id: z.string().optional(),
  role_id: z.string().optional(),
  status: z.boolean().optional(),
  phone: z.string().optional(),
});

export type UserFormData = z.infer<typeof userSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
