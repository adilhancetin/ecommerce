"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type User = { username: string; email: string; role: string };
type Item = { _id: string; category: string; name: string; desc: string; price: number; image: string; rating: number; number_of_reviewers: number };

const CATEGORIES = ["All", "vinyls", "antique", "gps", "shoes", "tent"];
const CATEGORY_LABELS: Record<string, string> = {
  "All": "All",
  "vinyls": "Vinyls",
  "antique": "Antique Furniture",
  "gps": "GPS Sport Watches",
  "shoes": "Running Shoes",
  "tent": "Camping Tents",
};

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [cart, setCart] = useState<Item[]>([]);
  const [showCart, setShowCart] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.replace("/login");
      return;
    }
    setUser(JSON.parse(stored));
    fetchItems();
  }, [router]);

  async function fetchItems() {
    const res = await fetch("/api/admin/item");
    const data = await res.json();
    setItems(data.items || []);
  }

  function handleLogout() {
    localStorage.removeItem("user");
    router.push("/login");
  }

  function addToCart(item: Item) {
    setCart((prev) => [...prev, item]);
  }

  const filtered = selectedCategory === "All"
    ? items
    : items.filter((p) => p.category === selectedCategory);

  if (!user) return null;

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">🛍️ ShopVintage</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Hello, <span className="font-semibold text-gray-900">{user.username}</span>
            </span>
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative px-4 py-2 text-sm font-medium border border-gray-200 rounded-full hover:border-blue-300 hover:text-blue-600 transition-colors cursor-pointer"
            >
              🛒 Cart
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
            {user.role === "admin" && (
              <a href="/admin" className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors">Admin</a>
            )}
            <a href="/account" className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-full hover:border-blue-300 hover:text-blue-600 transition-colors">My Account</a>
            <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-red-500 hover:text-red-600 cursor-pointer">Logout</button>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed top-16 right-4 z-50 bg-white border border-gray-200 rounded-xl shadow-xl w-80 p-4">
          <h3 className="font-bold mb-3">🛒 Your Cart ({cart.length})</h3>
          {cart.length === 0 ? (
            <p className="text-gray-400 text-sm">Cart is empty</p>
          ) : (
            <>
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {cart.map((item, i) => (
                  <li key={i} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                    <span>{item.image} {item.name}</span>
                    <span className="font-medium">${item.price.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between font-bold text-sm">
                <span>Total</span>
                <span>${cart.reduce((sum, i) => sum + i.price, 0).toFixed(2)}</span>
              </div>
              <button
                onClick={() => setCart([])}
                className="mt-3 w-full py-2 text-xs text-red-500 hover:text-red-700 cursor-pointer"
              >
                Clear Cart
              </button>
            </>
          )}
        </div>
      )}

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full">
        <section className="mb-10">
          <h2 className="text-3xl font-bold mb-2">Discover unique finds</h2>
          <p className="text-gray-500">Browse vinyls, antique furniture, watches, shoes, and more.</p>
        </section>

        {/* Category Filter */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </section>

        {/* Product Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              <a href={`/item/${item._id}`} className="block">
                <div className="h-48 bg-gray-50 flex items-center justify-center text-6xl">{item.image}</div>
                <div className="p-5">
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">{CATEGORY_LABELS[item.category] || item.category}</p>
                  <h3 className="font-semibold text-gray-900 mb-1 leading-snug">{item.name}</h3>
                  <p className="text-xs text-gray-400 mb-2">{item.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</span>
                    <span className="text-xs text-gray-400">⭐ {item.rating?.toFixed(1)} ({item.number_of_reviewers})</span>
                  </div>
                </div>
              </a>
              <div className="px-5 pb-4">
                <button
                  onClick={() => addToCart(item)}
                  className="w-full py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </section>

        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-20">No products found in this category.</p>
        )}
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        © 2026 ShopVintage. All rights reserved.
      </footer>
    </>
  );
}
