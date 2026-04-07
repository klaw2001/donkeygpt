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
  const provider = searchParams.get("provider") ?? "";
  const success = searchParams.get("success") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = 50;

  const where = {
    AND: [
      search ? { OR: [{ email: { contains: search, mode: "insensitive" as const } }, { ip: { contains: search } }] } : {},
      provider ? { provider } : {},
      success === "true" ? { success: true } : success === "false" ? { success: false } : {},
    ],
  };

  const [logins, total] = await Promise.all([
    prisma.loginEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.loginEvent.count({ where }),
  ]);

  return Response.json({ logins, total, page, pageSize });
}
