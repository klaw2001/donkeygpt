import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import UserDetailCharts from "@/components/admin/user-detail-charts";

interface PageProps {
  params: Promise<{ id: string }>;
}

function fmt(n: number) {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);
}

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      plan: true,
      disabled: true,
      createdAt: true,
      subscriptionStatus: true,
      subscriptionPeriodEnd: true,
      onboardingCompleted: true,
      simplicityLevel: true,
      accounts: { select: { provider: true } },
      signupEvent: true,
      loginEvents: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true, ip: true, city: true, country: true, provider: true },
      },
      chats: {
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { messages: true } },
          usageLogs: { select: { totalTokens: true } },
        },
      },
    },
  });

  if (!user) notFound();

  const allUsageLogs = await prisma.usageLog.findMany({
    where: { userId: id },
    select: { totalTokens: true, promptTokens: true, completionTokens: true, durationMs: true, createdAt: true },
  });

  const totalTokens = allUsageLogs.reduce((s: number, l: { totalTokens: number }) => s + l.totalTokens, 0);
  const totalMessages = user.chats.reduce((s: number, c: { _count: { messages: number } }) => s + c._count.messages, 0);
  const avgTokensPerChat = user.chats.length > 0 ? Math.round(totalTokens / user.chats.length) : 0;

  const dailyUsage = await prisma.$queryRaw<{ day: Date; tokens: bigint }[]>`
    SELECT date_trunc('day', "createdAt") AS day, COALESCE(SUM("totalTokens"), 0)::bigint AS tokens
    FROM "UsageLog"
    WHERE "userId" = ${id} AND "createdAt" >= NOW() - INTERVAL '30 days'
    GROUP BY date_trunc('day', "createdAt")
    ORDER BY day ASC
  `;

  const chats = user.chats.map((c: { id: string; title: string; createdAt: Date; updatedAt: Date; _count: { messages: number }; usageLogs: { totalTokens: number }[] }) => ({
    id: c.id,
    title: c.title,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    messageCount: c._count.messages,
    tokenCost: c.usageLogs.reduce((s: number, l: { totalTokens: number }) => s + l.totalTokens, 0),
  }));

  const providers = [...new Set(user.accounts.map((a: { provider: string }) => a.provider))];
  const hasPassword = !providers.includes("google");
  const authMethod = providers.includes("google") ? "Google" : "Email/Password";

  const lastLogin = user.loginEvents[0] ?? null;

  return (
    <div className="space-y-5">
      {/* Back */}
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-[#634629] hover:underline font-medium">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Users
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-[#e8e7f1] p-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            {user.image ? (
              <img src={user.image} alt={user.name ?? ""} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#eeedf7] flex items-center justify-center text-xl font-bold text-[#634629]">
                {(user.name ?? "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-[#1a1b22]">{user.name || "No name"}</h1>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${user.plan === "pro" ? "bg-[#6b38d4]/10 text-[#6b38d4]" : "bg-[#f4f2fd] text-[#4f453c]"}`}>
                {user.plan === "pro" && <span className="material-symbols-outlined text-[12px] mr-1">workspace_premium</span>}
                {user.plan}
              </span>
              {user.disabled && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">Disabled</span>}
            </div>
            <p className="text-sm text-[#81756b] mt-0.5">{user.email}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3">
              <InfoItem icon="calendar_today" label="Joined" value={new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
              <InfoItem icon="login" label="Auth" value={authMethod} />
              {user.signupEvent?.city && (
                <InfoItem icon="location_on" label="Signup location" value={`${user.signupEvent.city}, ${user.signupEvent.country}`} />
              )}
              {user.signupEvent?.ip && (
                <InfoItem icon="computer" label="Signup IP" value={user.signupEvent.ip} mono />
              )}
              {lastLogin && (
                <InfoItem icon="schedule" label="Last login" value={new Date(lastLogin.createdAt).toLocaleDateString()} />
              )}
              {user.subscriptionStatus && (
                <InfoItem icon="subscriptions" label="Sub status" value={user.subscriptionStatus} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat label="Total Chats" value={user.chats.length} icon="chat" />
        <MiniStat label="Total Messages" value={totalMessages} icon="forum" />
        <MiniStat label="Total Tokens" value={fmt(totalTokens)} icon="token" />
        <MiniStat label="Avg Tokens / Chat" value={fmt(avgTokensPerChat)} icon="analytics" />
      </div>

      {/* Charts */}
      <UserDetailCharts
        dailyUsage={dailyUsage.map((r: { day: Date; tokens: bigint }) => ({ day: r.day.toISOString().split("T")[0], tokens: Number(r.tokens) }))}
      />

      {/* Chats Table */}
      <div className="bg-white rounded-2xl border border-[#e8e7f1] p-5">
        <h2 className="text-sm font-semibold text-[#1a1b22] mb-4">Chats ({chats.length})</h2>
        {chats.length === 0 ? (
          <p className="text-sm text-[#81756b]">No chats yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e8e7f1]">
                  <th className="text-left pb-3 text-xs font-semibold text-[#81756b] pr-4">Title</th>
                  <th className="text-right pb-3 text-xs font-semibold text-[#81756b] pr-4">Messages</th>
                  <th className="text-right pb-3 text-xs font-semibold text-[#81756b] pr-4">Tokens</th>
                  <th className="text-left pb-3 text-xs font-semibold text-[#81756b]">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4f2fd]">
                {chats.map((c: { id: string; title: string; createdAt: string; updatedAt: string; messageCount: number; tokenCost: number }) => (
                  <tr key={c.id} className="hover:bg-[#faf9ff]">
                    <td className="py-2.5 pr-4">
                      <p className="font-medium text-[#1a1b22] truncate max-w-[280px]">{c.title}</p>
                      <p className="text-xs text-[#81756b]">{new Date(c.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="py-2.5 pr-4 text-right text-[#4f453c]">{c.messageCount}</td>
                    <td className="py-2.5 pr-4 text-right font-semibold text-[#634629]">{fmt(c.tokenCost)}</td>
                    <td className="py-2.5 text-xs text-[#81756b]">{new Date(c.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value, mono = false }: { icon: string; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="material-symbols-outlined text-[16px] text-[#81756b]">{icon}</span>
      <span className="text-xs text-[#81756b]">{label}:</span>
      <span className={`text-xs font-medium text-[#1a1b22] ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e7f1] p-4">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-medium text-[#4f453c]">{label}</p>
        <span className="material-symbols-outlined text-[18px] text-[#634629]/50">{icon}</span>
      </div>
      <p className="text-xl font-bold text-[#1a1b22]">{value}</p>
    </div>
  );
}
