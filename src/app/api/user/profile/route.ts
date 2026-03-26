import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      simplicityLevel: true,
      preferredTopics: true,
      createdAt: true,
    },
  });

  return Response.json(user);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = updateProfileSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: result.data,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      simplicityLevel: true,
      preferredTopics: true,
    },
  });

  return Response.json(user);
}
