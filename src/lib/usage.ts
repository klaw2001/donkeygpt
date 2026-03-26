import { prisma } from "@/lib/prisma";

export const FREE_DAILY_LIMIT = 20;

export async function getDailyMessageCount(userId: string): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  return prisma.usageLog.count({
    where: {
      userId,
      createdAt: { gte: startOfDay },
    },
  });
}

export async function checkMessageLimit(userId: string): Promise<{
  allowed: boolean;
  count: number;
  limit: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, subscriptionStatus: true },
  });

  if (!user) return { allowed: false, count: 0, limit: FREE_DAILY_LIMIT };

  if (user.plan === "pro" && user.subscriptionStatus === "active") {
    return { allowed: true, count: 0, limit: FREE_DAILY_LIMIT };
  }

  const count = await getDailyMessageCount(userId);
  return {
    allowed: count < FREE_DAILY_LIMIT,
    count,
    limit: FREE_DAILY_LIMIT,
  };
}
