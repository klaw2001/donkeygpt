import { prisma } from "@/lib/prisma";
import UsersTableClient from "@/components/admin/users-table";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      plan: true,
      disabled: true,
      createdAt: true,
      subscriptionStatus: true,
      signupEvent: { select: { ip: true, city: true, country: true } },
      _count: { select: { chats: true } },
      usageLogs: { select: { totalTokens: true } },
    },
  });

  type UserRow = { id: string; name: string | null; email: string; image: string | null; plan: string; disabled: boolean; createdAt: Date; subscriptionStatus: string | null; signupEvent: { ip: string | null; city: string | null; country: string | null } | null; _count: { chats: number }; usageLogs: { totalTokens: number }[] };
  const enriched = (users as UserRow[]).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image,
    plan: u.plan,
    disabled: u.disabled,
    createdAt: u.createdAt.toISOString(),
    subscriptionStatus: u.subscriptionStatus,
    signupEvent: u.signupEvent,
    chatCount: u._count.chats,
    totalTokens: u.usageLogs.reduce((s: number, l: { totalTokens: number }) => s + l.totalTokens, 0),
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1b22] tracking-tight">Users</h1>
        <p className="text-sm text-[#4f453c] mt-0.5">{enriched.length} registered users</p>
      </div>
      <UsersTableClient users={enriched} />
    </div>
  );
}
