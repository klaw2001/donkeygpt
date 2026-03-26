import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(email: string | null | undefined): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !email) return false;
  return email.toLowerCase() === adminEmail.toLowerCase();
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    totalUsers,
    totalChats,
    totalMessages,
    tokenAggregates,
    byModel,
    bySimplicity,
    dailyUsage,
    topUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.chat.count(),
    prisma.message.count(),
    prisma.usageLog.aggregate({
      _sum: { totalTokens: true, promptTokens: true, completionTokens: true },
      _avg: { totalTokens: true, durationMs: true },
      _count: { id: true },
    }),
    prisma.usageLog.groupBy({
      by: ["model"],
      _sum: { totalTokens: true },
      _count: { id: true },
    }),
    prisma.usageLog.groupBy({
      by: ["simplicityLevel"],
      _sum: { totalTokens: true },
      _count: { id: true },
      orderBy: { simplicityLevel: "asc" },
    }),
    prisma.$queryRaw<{ day: Date; requests: bigint; tokens: bigint }[]>`
      SELECT
        date_trunc('day', "createdAt") AS day,
        COUNT(*)::bigint AS requests,
        COALESCE(SUM("totalTokens"), 0)::bigint AS tokens
      FROM "UsageLog"
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY date_trunc('day', "createdAt")
      ORDER BY day ASC
    `,
    prisma.usageLog.groupBy({
      by: ["userId"],
      _sum: { totalTokens: true },
      _count: { id: true },
      orderBy: { _sum: { totalTokens: "desc" } },
      take: 10,
    }),
  ]);

  const topUserDetails = await prisma.user.findMany({
    where: { id: { in: topUsers.map((u: { userId: string }) => u.userId) } },
    select: { id: true, name: true, email: true },
  });
  const userMap = Object.fromEntries(topUserDetails.map((u: { id: string; name: string | null; email: string }) => [u.id, u]));

  return Response.json({
    overview: {
      totalUsers,
      totalChats,
      totalMessages,
      totalRequests: tokenAggregates._count.id,
      totalTokens: tokenAggregates._sum.totalTokens ?? 0,
      totalPromptTokens: tokenAggregates._sum.promptTokens ?? 0,
      totalCompletionTokens: tokenAggregates._sum.completionTokens ?? 0,
      avgTokensPerRequest: Math.round(tokenAggregates._avg.totalTokens ?? 0),
      avgDurationMs: Math.round(tokenAggregates._avg.durationMs ?? 0),
    },
    byModel: byModel.map((r: { model: string; _count: { id: number }; _sum: { totalTokens: number | null } }) => ({
      model: r.model,
      requests: r._count.id,
      totalTokens: r._sum.totalTokens ?? 0,
    })),
    bySimplicityLevel: bySimplicity.map((r: { simplicityLevel: number; _count: { id: number }; _sum: { totalTokens: number | null } }) => ({
      simplicityLevel: r.simplicityLevel,
      requests: r._count.id,
      totalTokens: r._sum.totalTokens ?? 0,
    })),
    dailyUsage: dailyUsage.map((r: { day: Date; requests: bigint; tokens: bigint }) => ({
      day: r.day,
      requests: Number(r.requests),
      tokens: Number(r.tokens),
    })),
    topUsers: topUsers.map((r: { userId: string; _count: { id: number }; _sum: { totalTokens: number | null } }) => ({
      userId: r.userId,
      name: userMap[r.userId]?.name ?? null,
      email: userMap[r.userId]?.email ?? null,
      requests: r._count.id,
      totalTokens: r._sum.totalTokens ?? 0,
    })),
  });
}
