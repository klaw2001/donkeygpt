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

  const [totalVisits, uniqueIps, topPages, byCountry, dailyVisits] = await Promise.all([
    prisma.pageVisit.count(),
    prisma.pageVisit.groupBy({ by: ["ip"], _count: { id: true } }).then((r: unknown[]) => r.length),
    prisma.pageVisit.groupBy({
      by: ["path"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.pageVisit.groupBy({
      by: ["country"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.$queryRaw<{ day: Date; visits: bigint; unique_ips: bigint }[]>`
      SELECT
        date_trunc('day', "createdAt") AS day,
        COUNT(*)::bigint AS visits,
        COUNT(DISTINCT ip)::bigint AS unique_ips
      FROM "PageVisit"
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY date_trunc('day', "createdAt")
      ORDER BY day ASC
    `,
  ]);

  return Response.json({
    totalVisits,
    uniqueIps,
    topPages: topPages.map((r: { path: string; _count: { id: number } }) => ({ path: r.path, visits: r._count.id })),
    byCountry: byCountry.map((r: { country: string | null; _count: { id: number } }) => ({ country: r.country ?? "Unknown", visits: r._count.id })),
    dailyVisits: dailyVisits.map((r: { day: Date; visits: bigint; unique_ips: bigint }) => ({
      day: r.day,
      visits: Number(r.visits),
      uniqueIps: Number(r.unique_ips),
    })),
  });
}
