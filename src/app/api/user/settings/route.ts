import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateSettingsSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });

  if (!settings) {
    settings = await prisma.userSettings.create({
      data: { userId: session.user.id },
    });
  }

  return Response.json(settings);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = updateSettingsSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const settings = await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...result.data },
    update: result.data,
  });

  return Response.json(settings);
}
