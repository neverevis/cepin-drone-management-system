"use client";

import { signOut } from "next-auth/react";
import { Icon } from "./Icon";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    >
      <Icon name="logout" className="h-4 w-4" />
      Sair
    </button>
  );
}
