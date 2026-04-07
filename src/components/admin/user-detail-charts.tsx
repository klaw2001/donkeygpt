"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  dailyUsage: { day: string; tokens: number }[];
}

function fmtDay(s: string) {
  const d = new Date(s);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function fmt(n: number) {
  return n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);
}

export default function UserDetailCharts({ dailyUsage }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e7f1] p-5">
      <h2 className="text-sm font-semibold text-[#1a1b22] mb-4">Token Usage (last 30 days)</h2>
      {dailyUsage.length === 0 ? (
        <div className="h-[160px] flex items-center justify-center text-sm text-[#81756b]">No usage data yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={dailyUsage} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="userTokenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#634629" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#634629" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0eef8" />
            <XAxis dataKey="day" tickFormatter={fmtDay} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip formatter={(v) => [fmt(Number(v)), "Tokens"]} labelFormatter={(s) => fmtDay(String(s))} />
            <Area type="monotone" dataKey="tokens" stroke="#634629" strokeWidth={2} fill="url(#userTokenGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
