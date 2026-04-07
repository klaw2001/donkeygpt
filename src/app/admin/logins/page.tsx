import { prisma } from "@/lib/prisma";
import type { LoginEvent } from "@/generated/prisma/client";
import LoginsTableClient from "@/components/admin/logins-table";

export default async function AdminLoginsPage() {
  const logins = await prisma.loginEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const serialized = logins.map((l: LoginEvent) => ({
    id: l.id,
    email: l.email,
    userId: l.userId,
    ip: l.ip,
    country: l.country,
    region: l.region,
    city: l.city,
    userAgent: l.userAgent,
    provider: l.provider,
    success: l.success,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1b22] tracking-tight">Login Events</h1>
        <p className="text-sm text-[#4f453c] mt-0.5">Last {serialized.length} login events</p>
      </div>
      <LoginsTableClient logins={serialized} />
    </div>
  );
}
