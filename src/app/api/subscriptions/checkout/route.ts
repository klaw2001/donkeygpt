import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true, plan: true },
  });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  if (user.plan === "pro") {
    return Response.json({ error: "Already subscribed" }, { status: 400 });
  }

  const subscription = await razorpay.subscriptions.create({
    plan_id: process.env.RAZORPAY_PLAN_ID!,
    total_count: 120, // max billing cycles (10 years)
    quantity: 1,
    notes: {
      userId: session.user.id,
      email: user.email,
    },
  });

  return Response.json({
    subscriptionId: subscription.id,
    key: process.env.RAZORPAY_KEY_ID!,
  });
}
