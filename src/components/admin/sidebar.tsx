"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const navItems = [
  { href: "/admin", label: "Overview", icon: "dashboard" },
  { href: "/admin/users", label: "Users", icon: "group" },
  { href: "/admin/logins", label: "Logins", icon: "login" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 h-full flex flex-col border-r border-[#e8e7f1] bg-white">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#e8e7f1]">
        <Image src="/brand-assets/main-logo.png" alt="DonkeyGPT" width={28} height={28} className="rounded-md" />
        <div>
          <p className="text-xs font-bold text-[#1a1b22] leading-tight">DonkeyGPT</p>
          <p className="text-[10px] font-semibold text-[#634629] uppercase tracking-wider">Admin</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-[#634629]/8 text-[#634629]"
                  : "text-[#4f453c] hover:bg-[#f4f2fd] hover:text-[#1a1b22]"
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${active ? "text-[#634629]" : "text-[#81756b]"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-[#e8e7f1]">
        <Link
          href="/chat"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#4f453c] hover:bg-[#f4f2fd] transition-all"
        >
          <span className="material-symbols-outlined text-[20px] text-[#81756b]">arrow_back</span>
          Back to App
        </Link>
      </div>
    </aside>
  );
}
