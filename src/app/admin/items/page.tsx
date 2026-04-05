"use client";

import { useState, useEffect } from "react";

type Item = {
  _id: string;
  category: string;
  name: string;
  desc: string;
  price: number;
  seller: string;
  condition: string;
  rating: number;
  number_of_reviewers: number;
};

const CATEGORIES = ["vinyls", "antique", "gps", "shoes", "tent", "other"];

export default function AdminItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  // Form state
  const [form, setForm] = useState({
    category: "vinyls",
    name: "",
    desc: "",
    price: "",
    seller: "",
    image: "",
    condition: "new",
    age: "",
    material: "",
    battery: "",
    size: "",
  });

  async function fetchItems() {
    const res = await fetch("/api/admin/item");
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/admin/item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
    });
    const data = await res.json();
    setMessage(data.message);
    if (res.ok) {
      setShowForm(false);
      setForm({ category: "vinyls", name: "", desc: "", price: "", seller: "", image: "", condition: "new", age: "", material: "", battery: "", size: "" });
      fetchItems();
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    const res = await fetch("/api/admin/item", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    setMessage(data.message);
    if (res.ok) fetchItems();
  }

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Items</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {showForm ? "Cancel" : "+ Add Item"}
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg">{message}</div>
      )}

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => updateForm("category", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
            <input value={form.name} onChange={(e) => updateForm("name", e.target.value)} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Price</label>
            <input type="number" step="0.01" value={form.price} onChange={(e) => updateForm("price", e.target.value)} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea value={form.desc} onChange={(e) => updateForm("desc", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Seller</label>
            <input value={form.seller} onChange={(e) => updateForm("seller", e.target.value)} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Condition</label>
            <input value={form.condition} onChange={(e) => updateForm("condition", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Image URL</label>
            <input value={form.image} onChange={(e) => updateForm("image", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>

          {/* Category-specific fields */}
          {(form.category === "vinyls" || form.category === "antique") && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Age</label>
              <input value={form.age} onChange={(e) => updateForm("age", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          )}
          {(form.category === "antique" || form.category === "shoes") && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Material</label>
              <input value={form.material} onChange={(e) => updateForm("material", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          )}
          {form.category === "gps" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Battery</label>
              <input value={form.battery} onChange={(e) => updateForm("battery", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          )}
          {form.category === "shoes" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Size</label>
              <input value={form.size} onChange={(e) => updateForm("size", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          )}

          <div className="col-span-2">
            <button type="submit" className="px-6 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
              Add Item
            </button>
          </div>
        </form>
      )}

      {/* Items Table */}
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-400">No items found.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Seller</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-gray-500">{item.category}</td>
                  <td className="px-4 py-3">${item.price?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-500">{item.seller}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {item.rating?.toFixed(1)} ({item.number_of_reviewers})
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(item._id, item.name)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
