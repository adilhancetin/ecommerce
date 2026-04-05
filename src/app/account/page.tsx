"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type UserData = { username: string; email: string; role: string };
type RatingEntry = { item_id: string; rating: number };
type ReviewEntry = { _id: string; item_id: string; review: string; rating?: number; created_at: string };

export default function AccountPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [ratings, setRatings] = useState<RatingEntry[]>([]);
  const [reviews, setReviews] = useState<ReviewEntry[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.replace("/login"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    fetchUserActivity(u.username);
  }, [router]);

  async function fetchUserActivity(username: string) {
    // Fetch all items to get all ratings/reviews
    const itemsRes = await fetch("/api/admin/item");
    const itemsData = await itemsRes.json();
    const allItems = itemsData.items || [];

    const allRatings: RatingEntry[] = [];
    const allReviews: ReviewEntry[] = [];

    for (const item of allItems) {
      // Fetch ratings
      const rRes = await fetch(`/api/rates/rating?item_id=${item._id}`);
      const rData = await rRes.json();
      const myRating = (rData.ratings || []).find((r: { username: string }) => r.username === username);
      if (myRating) allRatings.push({ item_id: item._id, rating: myRating.rating });

      // Fetch reviews
      const revRes = await fetch(`/api/rates/reviews?item_id=${item._id}`);
      const revData = await revRes.json();
      const myReview = (revData.reviews || []).find((r: { username: string }) => r.username === username);
      if (myReview) allReviews.push(myReview);
    }

    setRatings(allRatings);
    setReviews(allReviews);

    if (allRatings.length > 0) {
      const sum = allRatings.reduce((acc, r) => acc + r.rating, 0);
      setAvgRating(sum / allRatings.length);
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <a href="/" className="text-sm text-blue-600 hover:underline">← Back to Store</a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Profile Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
          <h1 className="text-2xl font-bold mb-4">My Account</h1>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Username</p>
              <p className="font-semibold text-lg">{user.username}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-semibold text-lg">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Role</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
              }`}>
                {user.role}
              </span>
            </div>
            <div>
              <p className="text-gray-500">Average Rating Given</p>
              <p className="font-semibold text-lg">
                {ratings.length > 0 ? `⭐ ${avgRating.toFixed(1)} (${ratings.length} items rated)` : "No ratings yet"}
              </p>
            </div>
          </div>
        </div>

        {/* My Reviews */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-lg mb-4">My Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-sm">You haven&apos;t written any reviews yet.</p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((r) => (
                <li key={r._id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <a href={`/item/${r.item_id}`} className="text-sm text-blue-600 hover:underline font-medium">
                      View Item →
                    </a>
                    {r.rating && <span className="text-xs text-gray-400">⭐ {r.rating}/5</span>}
                  </div>
                  <p className="text-sm text-gray-700">{r.review}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
