"use client";

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import Link from "next/link";

interface Stats {
  dailyUsage: { day: string; requests: number; tokens: number }[];
  userGrowth: { day: string; signups: number; cumulative: number }[];
  bySimplicityLevel: { level: string; requests: number }[];
  planDistribution: { plan: string; count: number }[];
  signupsByCountry: { country: string; count: number }[];
  topUsers: { userId: string; name: string; email: string; requests: number; totalTokens: number }[];
}

const COLORS = ["#634629", "#6b38d4", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#14b8a6"];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e7f1] p-5">
      <h3 className="text-sm font-semibold text-[#1a1b22] mb-4">{title}</h3>
      {children}
    </div>
  );
}

function fmt(n: number) {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);
}

function fmtDay(s: string) {
  const d = new Date(s);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function OverviewCharts({ stats }: { stats: Stats }) {
  return (
    <div className="space-y-4">
      {/* Row 1: Daily Usage + User Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Daily API Requests (30 days)">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.dailyUsage} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#634629" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#634629" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0eef8" />
              <XAxis dataKey="day" tickFormatter={fmtDay} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => [fmt(Number(v)), "Requests"]} labelFormatter={(s) => fmtDay(String(s))} />
              <Area type="monotone" dataKey="requests" stroke="#634629" strokeWidth={2} fill="url(#reqGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="User Growth (90 days)">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.userGrowth} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6b38d4" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6b38d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0eef8" />
              <XAxis dataKey="day" tickFormatter={fmtDay} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => [Number(v), "Cumulative Users"]} labelFormatter={(s) => fmtDay(String(s))} />
              <Area type="monotone" dataKey="cumulative" stroke="#6b38d4" strokeWidth={2} fill="url(#growthGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: Simplicity levels + Plan distribution + Geo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Usage by Simplicity Level">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.bySimplicityLevel} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0eef8" vertical={false} />
              <XAxis dataKey="level" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => [fmt(Number(v)), "Requests"]} />
              <Bar dataKey="requests" fill="#634629" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Plan Distribution">
          {stats.planDistribution.length > 0 ? (
            <div className="flex items-center justify-center gap-6 h-[200px]">
              <ResponsiveContainer width="60%" height={160}>
                <PieChart>
                  <Pie data={stats.planDistribution} dataKey="count" nameKey="plan" cx="50%" cy="50%" innerRadius={45} outerRadius={70}>
                    {stats.planDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [Number(v), "Users"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {stats.planDistribution.map((item, i) => (
                  <div key={item.plan} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs font-medium text-[#1a1b22] capitalize">{item.plan}</span>
                    <span className="text-xs text-[#81756b]">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-[#81756b]">No data yet</div>
          )}
        </ChartCard>

        <ChartCard title="Signups by Country">
          {stats.signupsByCountry.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.signupsByCountry} layout="vertical" margin={{ top: 4, right: 8, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0eef8" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="country" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
                <Tooltip formatter={(v) => [Number(v), "Signups"]} />
                <Bar dataKey="count" fill="#6b38d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-[#81756b]">No signup geo data yet</div>
          )}
        </ChartCard>
      </div>

      {/* Top Users Table */}
      {stats.topUsers.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#e8e7f1] p-5">
          <h3 className="text-sm font-semibold text-[#1a1b22] mb-4">Top Users by Token Usage</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e8e7f1]">
                  <th className="text-left pb-3 text-xs font-semibold text-[#81756b] pr-4">#</th>
                  <th className="text-left pb-3 text-xs font-semibold text-[#81756b] pr-4">User</th>
                  <th className="text-right pb-3 text-xs font-semibold text-[#81756b] pr-4">Requests</th>
                  <th className="text-right pb-3 text-xs font-semibold text-[#81756b]">Total Tokens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4f2fd]">
                {stats.topUsers.map((u, i) => (
                  <tr key={u.userId} className="hover:bg-[#faf9ff]">
                    <td className="py-2.5 pr-4 text-xs text-[#81756b]">{i + 1}</td>
                    <td className="py-2.5 pr-4">
                      <Link href={`/admin/users/${u.userId}`} className="hover:underline">
                        <p className="font-medium text-[#1a1b22]">{u.name || "—"}</p>
                        <p className="text-xs text-[#81756b]">{u.email}</p>
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4 text-right text-[#4f453c]">{u.requests.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-semibold text-[#634629]">{u.totalTokens.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
