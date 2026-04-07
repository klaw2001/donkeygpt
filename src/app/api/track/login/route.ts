import { prisma } from "@/lib/prisma";
import { getClientIp, getGeo } from "@/lib/geo";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return Response.json({ ok: false }, { status: 401 });
    }

    const { provider } = await request.json();
    const ip = getClientIp(request) ?? undefined;
    const geo = ip ? getGeo(ip) : {};
    const userAgent = request.headers.get("user-agent") ?? undefined;

    await prisma.loginEvent.create({
      data: {
        userId: session.user.id,
        email: session.user.email,
        provider: provider ?? "credentials",
        ip,
        userAgent,
        success: true,
        ...geo,
      },
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
