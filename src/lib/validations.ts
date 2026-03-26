import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    referral: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const chatMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(10000),
  chatId: z.string().nullable().optional(),
  simplicityLevel: z.number().min(1).max(5).default(3),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  simplicityLevel: z.number().min(1).max(5).optional(),
  preferredTopics: z.array(z.string()).optional(),
});

export const updateSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  defaultSimplicity: z.number().min(1).max(5).optional(),
  language: z.string().optional(),
  allowDataImprovement: z.boolean().optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
