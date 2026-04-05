"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type User = { username: string; email: string; role: string };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.replace("/login");
      return;
    }
    const parsed: User = JSON.parse(stored);
    if (parsed.role !== "admin") {
      router.replace("/");
      return;
    }
    setUser(parsed);
  }, [router]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-bold">🛠️ Admin Panel</h1>
            <nav className="flex gap-4 text-sm">
              <Link href="/admin" className="hover:text-blue-300 transition-colors">
                Dashboard
              </Link>
              <Link href="/admin/items" className="hover:text-blue-300 transition-colors">
                Items
              </Link>
              <Link href="/admin/users" className="hover:text-blue-300 transition-colors">
                Users
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">
              Logged in as <span className="text-white font-medium">{user.username}</span>
            </span>
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              ← Back to Store
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
        {children}
      </main>
    </div>
  );
}
