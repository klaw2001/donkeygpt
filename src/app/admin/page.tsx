import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import OverviewCharts from "@/components/admin/overview-charts";

async function getStats() {
  const session = await auth();
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://donkeygpt.io";
  const res = await fetch(`${baseUrl}/api/admin/stats`, {
    headers: { cookie: `next-auth.session-token=${session}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

function StatCard({ label, value, sub, icon }: { label: string; value: string | number; sub?: string; icon: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e7f1] p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-[#4f453c]">{label}</p>
        <span className="material-symbols-outlined text-[22px] text-[#634629]/60">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-[#1a1b22] tracking-tight">{value}</p>
      {sub && <p className="text-xs text-[#81756b] mt-1">{sub}</p>}
    </div>
  );
}

export default async function AdminHomePage() {
  const session = await auth();
  if (!session) redirect("/signin");

  // Fetch directly from Prisma on the server
  const { prisma } = await import("@/lib/prisma");

  const [totalUsers, totalChats, totalMessages, tokenAgg, activeSubscriptions, planDistribution, topUsers, dailyUsage, userGrowth, bySimplicity, signupsByCountry] = await Promise.all([
    prisma.user.count(),
    prisma.chat.count(),
    prisma.message.count(),
    prisma.usageLog.aggregate({
      _sum: { totalTokens: true },
      _count: { id: true },
      _avg: { totalTokens: true },
    }),
    prisma.user.count({ where: { plan: "pro", subscriptionStatus: "active" } }),
    prisma.user.groupBy({ by: ["plan"], _count: { id: true } }),
    prisma.usageLog.groupBy({
      by: ["userId"],
      _sum: { totalTokens: true },
      _count: { id: true },
      orderBy: { _sum: { totalTokens: "desc" } },
      take: 10,
    }),
    prisma.$queryRaw<{ day: Date; requests: bigint; tokens: bigint }[]>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::bigint AS requests, COALESCE(SUM("totalTokens"), 0)::bigint AS tokens
      FROM "UsageLog" WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY date_trunc('day', "createdAt") ORDER BY day ASC
    `,
    prisma.$queryRaw<{ day: Date; signups: bigint; cumulative: bigint }[]>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::bigint AS signups,
        SUM(COUNT(*)) OVER (ORDER BY date_trunc('day', "createdAt"))::bigint AS cumulative
      FROM "User" WHERE "createdAt" >= NOW() - INTERVAL '90 days'
      GROUP BY date_trunc('day', "createdAt") ORDER BY day ASC
    `,
    prisma.usageLog.groupBy({
      by: ["simplicityLevel"],
      _count: { id: true },
      orderBy: { simplicityLevel: "asc" },
    }),
    prisma.signupEvent.groupBy({
      by: ["country"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 8,
    }),
  ]);

  const topUserIds = topUsers.map((u: { userId: string }) => u.userId);
  const topUserDetails = await prisma.user.findMany({
    where: { id: { in: topUserIds } },
    select: { id: true, name: true, email: true },
  });
  const userMap = Object.fromEntries(topUserDetails.map((u: { id: string; name: string | null; email: string }) => [u.id, u]));

  const stats = {
    overview: {
      totalUsers,
      totalChats,
      totalMessages,
      totalTokens: Number(tokenAgg._sum.totalTokens ?? 0),
      totalRequests: tokenAgg._count.id,
      activeSubscriptions,
    },
    planDistribution: planDistribution.map((r: { plan: string; _count: { id: number } }) => ({ plan: r.plan, count: r._count.id })),
    dailyUsage: dailyUsage.map((r: { day: Date; requests: bigint; tokens: bigint }) => ({
      day: r.day.toISOString().split("T")[0],
      requests: Number(r.requests),
      tokens: Number(r.tokens),
    })),
    userGrowth: userGrowth.map((r: { day: Date; signups: bigint; cumulative: bigint }) => ({
      day: r.day.toISOString().split("T")[0],
      signups: Number(r.signups),
      cumulative: Number(r.cumulative),
    })),
    bySimplicityLevel: bySimplicity.map((r: { simplicityLevel: number; _count: { id: number } }) => ({
      level: `Level ${r.simplicityLevel}`,
      requests: r._count.id,
    })),
    signupsByCountry: signupsByCountry.map((r: { country: string | null; _count: { id: number } }) => ({
      country: r.country ?? "Unknown",
      count: r._count.id,
    })),
    topUsers: topUsers.map((r: { userId: string; _count: { id: number }; _sum: { totalTokens: number | null } }) => ({
      userId: r.userId,
      name: userMap[r.userId]?.name ?? "Unknown",
      email: userMap[r.userId]?.email ?? "",
      requests: r._count.id,
      totalTokens: r._sum.totalTokens ?? 0,
    })),
  };

  const fmtNum = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1b22] tracking-tight">Overview</h1>
        <p className="text-sm text-[#4f453c] mt-0.5">Platform analytics at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Users" value={fmtNum(stats.overview.totalUsers)} icon="group" />
        <StatCard label="Total Chats" value={fmtNum(stats.overview.totalChats)} icon="chat" />
        <StatCard label="Messages" value={fmtNum(stats.overview.totalMessages)} icon="forum" />
        <StatCard label="API Requests" value={fmtNum(stats.overview.totalRequests)} icon="bolt" />
        <StatCard label="Tokens Used" value={fmtNum(stats.overview.totalTokens)} icon="token" />
        <StatCard label="Pro Users" value={stats.overview.activeSubscriptions} sub="active subscriptions" icon="workspace_premium" />
      </div>

      {/* Charts */}
      <OverviewCharts stats={stats} />
    </div>
  );
}
