"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

type Item = { _id: string; category: string; name: string; desc: string; price: number; image: string; seller: string; condition: string; rating: number; number_of_reviewers: number };
type Review = { _id: string; username: string; review: string; rating?: number; created_at: string };

const CATEGORY_LABELS: Record<string, string> = {
  vinyls: "Vinyls", antique: "Antique Furniture", gps: "GPS Sport Watches", shoes: "Running Shoes", tent: "Camping Tents",
};

export default function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [myRating, setMyRating] = useState<number | null>(null);
  const [hasRated, setHasRated] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [hasReviewed, setHasReviewed] = useState(false);
  const [editingReview, setEditingReview] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.replace("/login"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    fetchItem();
    fetchReviews(u.username);
    fetchMyRating(u.username);
  }, [id, router]);

  async function fetchItem() {
    const res = await fetch("/api/admin/item");
    const data = await res.json();
    const found = (data.items || []).find((i: Item) => i._id === id);
    setItem(found || null);
  }

  async function fetchReviews(username?: string) {
    const res = await fetch(`/api/rates/reviews?item_id=${id}`);
    const data = await res.json();
    setReviews(data.reviews || []);
    const uname = username || user?.username;
    if (uname) {
      const mine = (data.reviews || []).find((r: Review) => r.username === uname);
      if (mine) {
        setHasReviewed(true);
        setReviewText(mine.review);
      }
    }
  }

  async function fetchMyRating(username: string) {
    const res = await fetch(`/api/rates/rating?item_id=${id}`);
    const data = await res.json();
    const mine = (data.ratings || []).find((r: { username: string; rating: number }) => r.username === username);
    if (mine) {
      setMyRating(mine.rating);
      setHasRated(true);
    }
  }

  async function submitRating(rating: number) {
    if (!user) return;
    const method = hasRated ? "PUT" : "POST";
    const res = await fetch("/api/rates/rating", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username, item_id: id, rating }),
    });
    const data = await res.json();
    setMessage(data.message);
    if (res.ok) {
      setMyRating(rating);
      setHasRated(true);
      fetchItem();
    }
  }

  async function submitReview() {
    if (!user || !reviewText.trim()) return;
    const method = hasReviewed ? "PUT" : "POST";
    const res = await fetch("/api/rates/reviews", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username, item_id: id, review: reviewText, rating: myRating }),
    });
    const data = await res.json();
    setMessage(data.message);
    if (res.ok) {
      setHasReviewed(true);
      setEditingReview(false);
      fetchReviews();
    }
  }

  async function deleteReview() {
    if (!user || !confirm("Delete your review?")) return;
    const res = await fetch("/api/rates/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username, item_id: id }),
    });
    if (res.ok) {
      setHasReviewed(false);
      setReviewText("");
      setEditingReview(false);
      fetchReviews();
    }
  }

  if (!item) return <div className="p-10 text-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <a href="/" className="text-sm text-blue-600 hover:underline">← Back to Store</a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {message && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg">{message}</div>
        )}

        {/* Item Details */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8">
          <div className="h-64 bg-gray-50 flex items-center justify-center text-8xl">{item.image}</div>
          <div className="p-8">
            <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">{CATEGORY_LABELS[item.category] || item.category}</p>
            <h1 className="text-2xl font-bold mb-2">{item.name}</h1>
            <p className="text-gray-500 mb-4">{item.desc}</p>
            <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
              <span>Seller: <strong>{item.seller}</strong></span>
              <span>Condition: <strong>{item.condition}</strong></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">${item.price.toFixed(2)}</span>
              <span className="text-sm text-gray-400">⭐ {item.rating?.toFixed(1)} ({item.number_of_reviewers} reviews)</span>
            </div>
          </div>
        </div>

        {/* Rate */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-bold text-lg mb-3">
            {hasRated ? "Your Rating" : "Rate this Item"}
          </h2>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => submitRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-3xl cursor-pointer transition-transform hover:scale-110"
              >
                {star <= (hoverRating || myRating || 0) ? "⭐" : "☆"}
              </button>
            ))}
            {myRating && <span className="ml-3 text-sm text-gray-500">You rated {myRating}/5</span>}
          </div>
        </div>

        {/* Write Review */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-bold text-lg mb-3">
            {hasReviewed && !editingReview ? "Your Review" : "Write a Review"}
          </h2>
          {hasReviewed && !editingReview ? (
            <div>
              <p className="text-gray-700 mb-3">{reviewText}</p>
              <div className="flex gap-3">
                <button onClick={() => setEditingReview(true)} className="text-sm text-blue-600 hover:underline cursor-pointer">Edit</button>
                <button onClick={deleteReview} className="text-sm text-red-500 hover:underline cursor-pointer">Delete</button>
              </div>
            </div>
          ) : (
            <div>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your review..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />
              <div className="flex gap-3">
                <button
                  onClick={submitReview}
                  className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  {hasReviewed ? "Update Review" : "Submit Review"}
                </button>
                {editingReview && (
                  <button onClick={() => setEditingReview(false)} className="text-sm text-gray-500 hover:underline cursor-pointer">Cancel</button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* All Reviews */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-lg mb-4">All Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((r) => (
                <li key={r._id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{r.username}</span>
                    {r.rating && <span className="text-xs text-gray-400">⭐ {r.rating}/5</span>}
                  </div>
                  <p className="text-sm text-gray-700">{r.review}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
