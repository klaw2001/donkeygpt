"use client";

import { useState } from "react";
import Link from "next/link";

interface LoginEvent {
  id: string;
  email: string | null;
  userId: string | null;
  ip: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  userAgent: string | null;
  provider: string;
  success: boolean;
  createdAt: string;
}

function fmtUA(ua: string | null) {
  if (!ua) return "—";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  return ua.slice(0, 20) + "…";
}

export default function LoginsTableClient({ logins }: { logins: LoginEvent[] }) {
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [successFilter, setSuccessFilter] = useState("");

  const filtered = logins.filter((l) => {
    const matchSearch = !search || l.email?.toLowerCase().includes(search.toLowerCase()) || l.ip?.includes(search);
    const matchProvider = !providerFilter || l.provider === providerFilter;
    const matchSuccess = !successFilter || (successFilter === "true" ? l.success : !l.success);
    return matchSearch && matchProvider && matchSuccess;
  });

  const exportCSV = () => {
    const rows = [
      ["Email", "Provider", "IP", "Country", "City", "Success", "Browser", "Timestamp"],
      ...filtered.map((l) => [
        l.email ?? "",
        l.provider,
        l.ip ?? "",
        l.country ?? "",
        l.city ?? "",
        l.success ? "yes" : "no",
        fmtUA(l.userAgent),
        new Date(l.createdAt).toLocaleString(),
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "logins.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or IP..."
          className="flex-1 min-w-[200px] max-w-sm px-3 py-2 text-sm border border-[#e8e7f1] rounded-lg outline-none focus:ring-2 focus:ring-[#634629]/20 focus:border-[#634629] bg-white"
        />
        <select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-[#e8e7f1] rounded-lg outline-none bg-white focus:ring-2 focus:ring-[#634629]/20"
        >
          <option value="">All Providers</option>
          <option value="credentials">Email/Password</option>
          <option value="google">Google</option>
        </select>
        <select
          value={successFilter}
          onChange={(e) => setSuccessFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-[#e8e7f1] rounded-lg outline-none bg-white focus:ring-2 focus:ring-[#634629]/20"
        >
          <option value="">All Results</option>
          <option value="true">Success</option>
          <option value="false">Failed</option>
        </select>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#4f453c] border border-[#e8e7f1] rounded-lg hover:bg-[#f4f2fd] bg-white transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export CSV
        </button>
        <span className="text-xs text-[#81756b] ml-auto">{filtered.length} events</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e8e7f1] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#faf9ff] border-b border-[#e8e7f1]">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#81756b]">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#81756b]">IP Address</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#81756b]">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#81756b]">Provider</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#81756b]">Browser</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#81756b]">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#81756b]">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f2fd]">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-[#81756b]">No login events yet</td>
                </tr>
              )}
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-[#faf9ff] transition-colors">
                  <td className="px-4 py-3">
                    {l.email ? (
                      l.userId ? (
                        <Link href={`/admin/users/${l.userId}`} className="hover:underline font-medium text-[#1a1b22]">
                          {l.email}
                        </Link>
                      ) : (
                        <span className="font-medium text-[#1a1b22]">{l.email}</span>
                      )
                    ) : (
                      <span className="text-[#81756b]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-[#4f453c]">{l.ip ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#4f453c]">
                    {l.city ? `${l.city}, ${l.country}` : l.country ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${l.provider === "google" ? "bg-blue-50 text-blue-700" : "bg-[#f4f2fd] text-[#4f453c]"}`}>
                      {l.provider === "google" ? (
                        <svg viewBox="0 0 24 24" className="w-3 h-3"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                      ) : (
                        <span className="material-symbols-outlined text-[12px]">mail</span>
                      )}
                      {l.provider === "google" ? "Google" : "Email"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#81756b]">{fmtUA(l.userAgent)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${l.success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                      {l.success ? "Success" : "Failed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#81756b] whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
