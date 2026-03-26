"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signUpSchema } from "@/lib/validations";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function signUpAction(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    referral: formData.get("referral"),
  };

  const result = signUpSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { name, email, password } = result.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const hashed = await hashPassword(password);
  await prisma.user.create({
    data: { name, email, password: hashed },
  });

  return { success: true };
}

export async function signInAction(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/chat",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }
}

export async function signInWithGoogleAction() {
  await signIn("google", { redirectTo: "/chat" });
}
