import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDailyMessageCount, FREE_DAILY_LIMIT } from "@/lib/usage";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      subscriptionStatus: true,
      subscriptionPeriodEnd: true,
      subscription: {
        select: { cancelAtPeriodEnd: true },
      },
    },
  });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const isPro = user.plan === "pro" && user.subscriptionStatus === "active";
  const dailyCount = isPro ? 0 : await getDailyMessageCount(session.user.id);

  return Response.json({
    plan: user.plan,
    status: user.subscriptionStatus ?? null,
    periodEnd: user.subscriptionPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: user.subscription?.cancelAtPeriodEnd ?? false,
    dailyMessageCount: dailyCount,
    dailyMessageLimit: isPro ? null : FREE_DAILY_LIMIT,
  });
}
