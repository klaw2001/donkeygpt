import { prisma } from "@/lib/prisma";
import { getClientIp, getGeo } from "@/lib/geo";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { path } = await request.json();
    const ip = getClientIp(request) ?? "unknown";
    const geo = getGeo(ip);
    const session = await auth();
    const userAgent = request.headers.get("user-agent") ?? undefined;

    await prisma.pageVisit.create({
      data: {
        ip,
        path: path ?? "/",
        userAgent,
        userId: session?.user?.id ?? null,
        ...geo,
      },
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
