import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// Map Razorpay subscription statuses to internal statuses
function mapStatus(rzpStatus: string): string {
  switch (rzpStatus) {
    case "active":
      return "active";
    case "pending":
    case "halted":
      return "past_due";
    case "cancelled":
    case "completed":
    case "expired":
      return "canceled";
    default:
      return "incomplete";
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return Response.json({ error: "Missing x-razorpay-signature header" }, { status: 400 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== signature) {
    console.error("[Webhook] Razorpay signature verification failed");
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event: string; payload: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    switch (event.event) {
      case "subscription.activated":
        await handleSubscriptionActivated(event.payload);
        break;
      case "subscription.charged":
        await handleSubscriptionCharged(event.payload);
        break;
      case "subscription.updated":
        await handleSubscriptionUpdated(event.payload);
        break;
      case "subscription.cancelled":
        await handleSubscriptionCancelled(event.payload);
        break;
      case "payment.failed":
        await handlePaymentFailed(event.payload);
        break;
      default:
        console.log(`[Webhook] Unhandled event type: ${event.event}`);
    }
  } catch (err) {
    console.error(`[Webhook] Error processing event ${event.event}:`, err);
    return Response.json({ error: "Internal processing error" }, { status: 500 });
  }

  return Response.json({ received: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSubscription(payload: Record<string, unknown>): any {
  return (payload as { subscription?: { entity?: unknown } }).subscription?.entity;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPayment(payload: Record<string, unknown>): any {
  return (payload as { payment?: { entity?: unknown } }).payment?.entity;
}

async function handleSubscriptionActivated(payload: Record<string, unknown>) {
  const sub = getSubscription(payload);
  if (!sub) return;

  const userId = sub.notes?.userId as string | undefined;
  if (!userId) {
    console.warn("[Webhook] subscription.activated: missing notes.userId");
    return;
  }

  const periodStart = new Date(sub.current_start * 1000);
  const periodEnd = new Date(sub.current_end * 1000);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        plan: "pro",
        razorpayCustomerId: sub.customer_id ?? null,
        subscriptionStatus: "active",
        subscriptionPeriodEnd: periodEnd,
      },
    }),
    prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        razorpaySubscriptionId: sub.id,
        razorpayPlanId: sub.plan_id,
        status: "active",
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: sub.cancel_at_cycle_end === 1,
      },
      update: {
        razorpaySubscriptionId: sub.id,
        razorpayPlanId: sub.plan_id,
        status: "active",
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: sub.cancel_at_cycle_end === 1,
      },
    }),
  ]);
}

async function handleSubscriptionCharged(payload: Record<string, unknown>) {
  const sub = getSubscription(payload);
  const payment = getPayment(payload);
  if (!sub || !payment) return;

  const user = await prisma.user.findFirst({
    where: { subscription: { razorpaySubscriptionId: sub.id } },
    select: { id: true },
  });
  if (!user) return;

  const periodStart = sub.current_start ? new Date(sub.current_start * 1000) : null;
  const periodEnd = sub.current_end ? new Date(sub.current_end * 1000) : null;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        plan: "pro",
        subscriptionStatus: "active",
        subscriptionPeriodEnd: periodEnd ?? undefined,
      },
    }),
    prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status: "active",
        currentPeriodStart: periodStart ?? undefined,
        currentPeriodEnd: periodEnd ?? undefined,
        cancelAtPeriodEnd: sub.cancel_at_cycle_end === 1,
      },
    }),
    prisma.invoice.upsert({
      where: { razorpayPaymentId: payment.id },
      create: {
        userId: user.id,
        razorpayPaymentId: payment.id,
        amountPaid: payment.amount,
        currency: payment.currency ?? "inr",
        status: payment.status === "captured" ? "paid" : payment.status,
        periodStart,
        periodEnd,
      },
      update: {
        status: payment.status === "captured" ? "paid" : payment.status,
        amountPaid: payment.amount,
      },
    }),
  ]);
}

async function handleSubscriptionUpdated(payload: Record<string, unknown>) {
  const sub = getSubscription(payload);
  if (!sub) return;

  const user = await prisma.user.findFirst({
    where: { subscription: { razorpaySubscriptionId: sub.id } },
    select: { id: true },
  });
  if (!user) return;

  const status = mapStatus(sub.status);
  const isActive = status === "active";
  const periodEnd = sub.current_end ? new Date(sub.current_end * 1000) : undefined;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        plan: isActive ? "pro" : "free",
        subscriptionStatus: status,
        subscriptionPeriodEnd: periodEnd,
      },
    }),
    prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: sub.cancel_at_cycle_end === 1,
      },
    }),
  ]);
}

async function handleSubscriptionCancelled(payload: Record<string, unknown>) {
  const sub = getSubscription(payload);
  if (!sub) return;

  const user = await prisma.user.findFirst({
    where: { subscription: { razorpaySubscriptionId: sub.id } },
    select: { id: true },
  });
  if (!user) return;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        plan: "free",
        subscriptionStatus: "canceled",
      },
    }),
    prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status: "canceled",
        cancelAtPeriodEnd: false,
      },
    }),
  ]);
}

async function handlePaymentFailed(payload: Record<string, unknown>) {
  const payment = getPayment(payload);
  if (!payment?.subscription_id) return;

  const user = await prisma.user.findFirst({
    where: { subscription: { razorpaySubscriptionId: payment.subscription_id } },
    select: { id: true },
  });
  if (!user) return;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { subscriptionStatus: "past_due" },
    }),
    prisma.invoice.upsert({
      where: { razorpayPaymentId: payment.id },
      create: {
        userId: user.id,
        razorpayPaymentId: payment.id,
        amountPaid: 0,
        currency: payment.currency ?? "inr",
        status: "failed",
      },
      update: {
        status: "failed",
      },
    }),
  ]);
}
