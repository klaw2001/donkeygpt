import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      chats: { include: { messages: true } },
      settings: true,
    },
  });

  const exportData = {
    exportedAt: new Date().toISOString(),
    user: {
      id: data?.id,
      name: data?.name,
      email: data?.email,
      createdAt: data?.createdAt,
    },
    settings: data?.settings,
    chats: data?.chats,
  };

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="donkeygpt-data-${Date.now()}.json"`,
    },
  });
}
