"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, Send, PenSquare } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (["/inbox", "/sent"].includes(path)) {
      return pathname === path || pathname?.startsWith(`${path}/`);
    }
    return pathname === path;
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
      <h1 className="text-xl font-bold mb-8 text-gray-800">Email Client</h1>
      <nav className="space-y-2">
        <Link
          href="/inbox"
          className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
            isActive("/inbox")
              ? "bg-blue-100 text-blue-700"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Inbox size={20} />
          <span>Inbox</span>
        </Link>
        <Link
          href="/sent"
          className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
            isActive("/sent")
              ? "bg-blue-100 text-blue-700"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Send size={20} />
          <span>Sent</span>
        </Link>
        <Link
          href="/compose"
          className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
            isActive("/compose")
              ? "bg-blue-100 text-blue-700"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <PenSquare size={20} />
          <span>Compose</span>
        </Link>
      </nav>
    </div>
  );
}
