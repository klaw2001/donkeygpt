import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import OnboardingClient from "./OnboardingClient";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true },
  });

  if (user?.onboardingCompleted) redirect("/chat");

  return (
    <Suspense>
      <OnboardingClient />
    </Suspense>
  );
}
