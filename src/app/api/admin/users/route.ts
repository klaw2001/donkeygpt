import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(email: string | null | undefined): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !email) return false;
  return email.toLowerCase() === adminEmail.toLowerCase();
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const plan = searchParams.get("plan") ?? "";
  const status = searchParams.get("status") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = 20;

  const where = {
    AND: [
      search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { email: { contains: search, mode: "insensitive" as const } }] } : {},
      plan ? { plan } : {},
      status === "disabled" ? { disabled: true } : status === "active" ? { disabled: false } : {},
    ],
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        plan: true,
        disabled: true,
        createdAt: true,
        subscriptionStatus: true,
        subscriptionPeriodEnd: true,
        signupEvent: { select: { ip: true, city: true, country: true, region: true } },
        _count: { select: { chats: true } },
        usageLogs: {
          select: { totalTokens: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  type UserRow = { id: string; name: string | null; email: string; image: string | null; plan: string; disabled: boolean; createdAt: Date; subscriptionStatus: string | null; signupEvent: { ip: string | null; city: string | null; country: string | null } | null; _count: { chats: number }; usageLogs: { totalTokens: number }[] };
  const enriched = (users as UserRow[]).map((u) => ({
    ...u,
    totalTokens: u.usageLogs.reduce((sum: number, l: { totalTokens: number }) => sum + l.totalTokens, 0),
    usageLogs: undefined,
  }));

  return Response.json({ users: enriched, total, page, pageSize });
}
