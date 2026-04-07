"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  plan: string;
  disabled: boolean;
  createdAt: string;
  subscriptionStatus: string | null;
  signupEvent: { ip: string | null; city: string | null; country: string | null } | null;
  chatCount: number;
  totalTokens: number;
}

function fmt(n: number) {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);
}

function Avatar({ name, image, size = 32 }: { name: string | null; image: string | null; size?: number }) {
  if (image) return <img src={image} alt={name ?? ""} width={size} height={size} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  const initials = (name ?? "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="rounded-full bg-[#eeedf7] flex items-center justify-center text-xs font-bold text-[#634629]" style={{ width: size, height: size }}>
      {initials}
    </div>
  );
}

export default function UsersTableClient({ users: initialUsers }: { users: User[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editPlan, setEditPlan] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = !planFilter || u.plan === planFilter;
    const matchStatus = !statusFilter || (statusFilter === "disabled" ? u.disabled : !u.disabled);
    return matchSearch && matchPlan && matchStatus;
  });

  const openEdit = (u: User) => {
    setEditUser(u);
    setEditName(u.name ?? "");
    setEditPlan(u.plan);
  };

  const saveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, plan: editPlan }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === editUser.id ? { ...u, name: updated.name, plan: updated.plan } : u)));
      setEditUser(null);
      toast.success("User updated");
    } catch {
      toast.error("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const toggleDisable = async (u: User) => {
    const action = u.disabled ? "enable" : "disable";
    if (!confirm(`Are you sure you want to ${action} ${u.email}?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabled: !u.disabled }),
      });
      if (!res.ok) throw new Error();
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, disabled: !u.disabled } : x)));
      toast.success(`User ${action}d`);
    } catch {
      toast.error(`Failed to ${action} user`);
    }
  };

  const exportCSV = () => {
    const rows = [
      ["Name", "Email", "Plan", "Status", "Chats", "Total Tokens", "Signup City", "Signup Country", "Joined"],
      ...filtered.map((u) => [
        u.name ?? "",
        u.email,
        u.plan,
        u.disabled ? "disabled" : "active",
        u.chatCount,
        u.totalTokens,
        u.signupEvent?.city ?? "",
        u.signupEvent?.country ?? "",
        new Date(u.createdAt).toLocaleDateString(),
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-base font-bold text-[#1a1b22] mb-4">Edit User</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#4f453c]">Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm border border-[#e8e7f1] rounded-lg outline-none focus:ring-2 focus:ring-[#634629]/20 focus:border-[#634629]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#4f453c]">Plan</label>
                <select
                  value={editPlan}
                  onChange={(e) => setEditPlan(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm border border-[#e8e7f1] rounded-lg outline-none focus:ring-2 focus:ring-[#634629]/20"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setEditUser(null)} className="flex-1 py-2 text-sm font-medium text-[#4f453c] border border-[#e8e7f1] rounded-lg hover:bg-[#f4f2fd]">Cancel</button>
              <button onClick={saveEdit} disabled={saving} className="flex-1 py-2 text-sm font-bold text-white bg-[#634629] rounded-lg hover:bg-[#5a3e24] disabled:opacity-60">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 min-w-[200px] max-w-sm px-3 py-2 text-sm border border-[#e8e7f1] rounded-lg outline-none focus:ring-2 focus:ring-[#634629]/20 focus:border-[#634629] bg-white"
        />
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-[#e8e7f1] rounded-lg outline-none bg-white focus:ring-2 focus:ring-[#634629]/20"
        >
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-[#e8e7f1] rounded-lg outline-none bg-white focus:ring-2 focus:ring-[#634629]/20"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#4f453c] border border-[#e8e7f1] rounded-lg hover:bg-[#f4f2fd] bg-white transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export CSV
        </button>
        <span className="text-xs text-[#81756b] ml-auto">{filtered.length} users</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e8e7f1] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#faf9ff] border-b border-[#e8e7f1]">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#81756b]">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#81756b]">Plan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#81756b]">Signup Location</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#81756b]">Chats</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#81756b]">Tokens</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#81756b]">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#81756b]">Joined</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#81756b]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f2fd]">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-[#81756b]">No users found</td>
                </tr>
              )}
              {filtered.map((u) => (
                <tr key={u.id} className={`hover:bg-[#faf9ff] transition-colors ${u.disabled ? "opacity-60" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} image={u.image} size={32} />
                      <div>
                        <p className="font-medium text-[#1a1b22] leading-tight">{u.name || <span className="text-[#81756b]">No name</span>}</p>
                        <p className="text-xs text-[#81756b]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${u.plan === "pro" ? "bg-[#6b38d4]/10 text-[#6b38d4]" : "bg-[#f4f2fd] text-[#4f453c]"}`}>
                      {u.plan === "pro" && <span className="material-symbols-outlined text-[12px] mr-1">workspace_premium</span>}
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.signupEvent?.city ? (
                      <div>
                        <p className="text-[#1a1b22] text-xs">{u.signupEvent.city}, {u.signupEvent.country}</p>
                        <p className="text-[10px] text-[#81756b] font-mono">{u.signupEvent.ip}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-[#81756b]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-[#4f453c]">{u.chatCount}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#634629]">{fmt(u.totalTokens)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${u.disabled ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
                      {u.disabled ? "Disabled" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#81756b]">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 justify-center">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="p-1.5 rounded-lg hover:bg-[#f4f2fd] text-[#634629] transition-colors"
                        title="View details"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </Link>
                      <button
                        onClick={() => openEdit(u)}
                        className="p-1.5 rounded-lg hover:bg-[#f4f2fd] text-[#4f453c] transition-colors"
                        title="Edit user"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => toggleDisable(u)}
                        className={`p-1.5 rounded-lg transition-colors ${u.disabled ? "hover:bg-emerald-50 text-emerald-600" : "hover:bg-red-50 text-red-500"}`}
                        title={u.disabled ? "Enable user" : "Disable user"}
                      >
                        <span className="material-symbols-outlined text-[18px]">{u.disabled ? "check_circle" : "block"}</span>
                      </button>
                    </div>
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
