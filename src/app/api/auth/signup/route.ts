import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signUpSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const body = await request.json();
  const result = signUpSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, email, password } = result.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
    select: { id: true, email: true, name: true },
  });

  return Response.json(user, { status: 201 });
}
