"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/nav";
import { ROLE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";
import { SignOutButton } from "./SignOutButton";

function NavLinks({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
      {items.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-cepin-50 text-cepin-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Icon name={item.icon} className="h-5 w-5 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-cepin-600 text-sm font-bold text-white">
        C
      </div>
      <div>
        <p className="text-sm font-semibold leading-tight text-gray-900">CEPIN</p>
        <p className="text-xs leading-tight text-gray-500">Gestão do Drone</p>
      </div>
    </div>
  );
}

export function AppShell({
  items,
  name,
  role,
  children,
}: {
  items: NavItem[];
  name: string;
  role: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
        <Brand />
        <NavLinks items={items} />
        <div className="border-t border-gray-200 p-3 text-xs text-gray-400">
          IFSP - Câmpus Araraquara
        </div>
      </aside>

      {/* Sidebar mobile (overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-50 flex w-64 flex-col bg-white shadow-xl">
            <Brand />
            <NavLinks items={items} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
          <button
            type="button"
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-900">{name}</p>
              <p className="text-xs text-gray-500">{ROLE_LABELS[role] ?? role}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cepin-100 text-sm font-semibold text-cepin-700">
              {name.charAt(0).toUpperCase()}
            </div>
            <SignOutButton />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
