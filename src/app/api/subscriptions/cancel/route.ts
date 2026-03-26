import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    select: { razorpaySubscriptionId: true, status: true },
  });

  if (!subscription?.razorpaySubscriptionId) {
    return Response.json({ error: "No active subscription found" }, { status: 404 });
  }

  if (subscription.status === "canceled") {
    return Response.json({ error: "Subscription already canceled" }, { status: 400 });
  }

  await razorpay.subscriptions.cancel(subscription.razorpaySubscriptionId, true);

  await prisma.subscription.update({
    where: { userId: session.user.id },
    data: { cancelAtPeriodEnd: true },
  });

  return Response.json({ success: true });
}
