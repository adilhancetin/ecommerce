import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

/* ─────────────────────────────────────────────────────
   15 items — at least one per category (vinyls, antique, gps, shoes, tent)
   ───────────────────────────────────────────────────── */
const SAMPLE_ITEMS = [
    { category: "vinyls", name: "Abbey Road – The Beatles", desc: "Classic vinyl record", price: 34.99, seller: "VinylShop", image: "🎵", condition: "mint", age: "1969", rating: 0, number_of_reviewers: 0 },
    { category: "vinyls", name: "Dark Side of the Moon – Pink Floyd", desc: "Legendary progressive rock album", price: 29.99, seller: "VinylShop", image: "🎵", condition: "good", age: "1973", rating: 0, number_of_reviewers: 0 },
    { category: "vinyls", name: "Rumours – Fleetwood Mac", desc: "Timeless classic", price: 27.99, seller: "VinylShop", image: "🎵", condition: "mint", age: "1977", rating: 0, number_of_reviewers: 0 },
    { category: "antique", name: "Victorian Oak Writing Desk", desc: "Beautifully restored Victorian era desk", price: 1249.00, seller: "AntiqueHouse", image: "🪑", condition: "restored", age: "1880", material: "oak", rating: 0, number_of_reviewers: 0 },
    { category: "antique", name: "Art Deco Walnut Cabinet", desc: "Elegant walnut cabinet from the 1930s", price: 899.00, seller: "AntiqueHouse", image: "🪑", condition: "good", age: "1935", material: "walnut", rating: 0, number_of_reviewers: 0 },
    { category: "antique", name: "Georgian Mahogany Bookcase", desc: "Rare Georgian era bookcase", price: 1599.00, seller: "AntiqueHouse", image: "🪑", condition: "fair", age: "1790", material: "mahogany", rating: 0, number_of_reviewers: 0 },
    { category: "gps", name: "Garmin Forerunner 265", desc: "Advanced GPS running watch with AMOLED display", price: 449.99, seller: "TechGear", image: "⌚", condition: "new", battery: "13 days", rating: 0, number_of_reviewers: 0 },
    { category: "gps", name: "Polar Vantage V3", desc: "Premium multisport GPS watch", price: 499.99, seller: "TechGear", image: "⌚", condition: "new", battery: "8 days", rating: 0, number_of_reviewers: 0 },
    { category: "gps", name: "Suunto Race S", desc: "Lightweight GPS sport watch", price: 399.99, seller: "TechGear", image: "⌚", condition: "new", battery: "26 hours", rating: 0, number_of_reviewers: 0 },
    { category: "shoes", name: "Nike Pegasus 41", desc: "Versatile everyday running shoe", price: 129.99, seller: "RunFast", image: "👟", condition: "new", size: "42", material: "mesh", rating: 0, number_of_reviewers: 0 },
    { category: "shoes", name: "Adidas Ultraboost Light", desc: "Ultra responsive cushioning", price: 189.99, seller: "RunFast", image: "👟", condition: "new", size: "43", material: "primeknit", rating: 0, number_of_reviewers: 0 },
    { category: "shoes", name: "New Balance Fresh Foam X", desc: "Plush comfort for long runs", price: 159.99, seller: "RunFast", image: "👟", condition: "new", size: "41", material: "synthetic mesh", rating: 0, number_of_reviewers: 0 },
    { category: "tent", name: "MSR Hubba Hubba 2-Person", desc: "Ultralight backpacking tent", price: 479.99, seller: "CampWorld", image: "⛺", condition: "new", rating: 0, number_of_reviewers: 0 },
    { category: "tent", name: "REI Half Dome SL 3+", desc: "Spacious 3-season tent", price: 349.99, seller: "CampWorld", image: "⛺", condition: "new", rating: 0, number_of_reviewers: 0 },
    { category: "tent", name: "Big Agnes Copper Spur HV UL2", desc: "Award-winning ultralight tent", price: 449.99, seller: "CampWorld", image: "⛺", condition: "new", rating: 0, number_of_reviewers: 0 },
];

/* ─────────────────────────────────────────────────────
   3 regular users + 1 admin user  (password for ALL is "test")
   ───────────────────────────────────────────────────── */
const SAMPLE_USERS = [
    { username: "testadmin", email: "admin@shopvintage.com", role: "admin" },
    { username: "alice", email: "alice@example.com", role: "user" },
    { username: "bob", email: "bob@example.com", role: "user" },
    { username: "charlie", email: "charlie@example.com", role: "user" },
];

/* ─────────────────────────────────────────────────────
   Realistic reviews & ratings from each of the 3 regular users
   for every item  (index corresponds to SAMPLE_ITEMS order)
   ───────────────────────────────────────────────────── */
const USER_REVIEWS: Record<string, { rating: number; review: string }[]> = {
    alice: [
        { rating: 5, review: "Absolutely love this pressing! The sound quality is incredible, warm and crisp at the same time." },
        { rating: 4, review: "A must-have for any vinyl collector. The album artwork on the sleeve is gorgeous too." },
        { rating: 5, review: "Fleetwood Mac at their best. This record is in perfect condition and sounds phenomenal." },
        { rating: 5, review: "The craftsmanship on this desk is outstanding. It feels like owning a piece of history." },
        { rating: 4, review: "Beautiful cabinet with lovely Art Deco detailing. A few minor scratches but overall excellent." },
        { rating: 3, review: "Impressive piece but the wood shows its age. Still, a great conversation starter in any room." },
        { rating: 5, review: "The AMOLED display is stunning and the GPS accuracy is spot on. Best running investment I made." },
        { rating: 4, review: "Excellent multisport tracking. The battery could be a bit longer but overall very satisfied." },
        { rating: 4, review: "Lightweight and responsive. Great value for the price point compared to competitors." },
        { rating: 5, review: "These shoes are incredibly comfortable right out of the box. Perfect for my daily 5K runs." },
        { rating: 4, review: "The boost cushioning is amazing. They run a bit narrow but the comfort is unmatched." },
        { rating: 4, review: "Great shoes for long distance. The Fresh Foam midsole provides excellent support." },
        { rating: 5, review: "Setup was a breeze and the tent is incredibly lightweight. Perfect for my solo hikes." },
        { rating: 3, review: "Spacious interior but a bit heavy for backpacking. Great for car camping though." },
        { rating: 5, review: "The best ultralight tent I have ever used. Weathered a storm and stayed completely dry." },
    ],
    bob: [
        { rating: 4, review: "Classic album, classic pressing. A few pops on side B but the overall experience is excellent." },
        { rating: 5, review: "Hands down the best vinyl I own. Every track sounds like a live performance." },
        { rating: 4, review: "Great record. The Dreams track on vinyl is pure bliss. Minor sleeve wear but vinyl is mint." },
        { rating: 4, review: "Solid construction and beautiful patina. I refinished the top and it looks amazing now." },
        { rating: 5, review: "This cabinet is the centerpiece of my living room. The walnut grain is stunning." },
        { rating: 4, review: "Heavy and well-built. The shelves are perfectly spaced for my book collection." },
        { rating: 4, review: "Reliable GPS and great training features. The music storage is a nice bonus." },
        { rating: 5, review: "Upgraded from Polar V2 and it is a massive improvement. The biosensor suite is incredible." },
        { rating: 3, review: "Good watch but the interface takes some getting used to. GPS lock time could be faster." },
        { rating: 4, review: "Very comfortable and responsive. These have become my go-to training shoes." },
        { rating: 5, review: "Best Ultraboost yet! The Light version really is noticeably lighter without sacrificing cushion." },
        { rating: 3, review: "Decent shoes but the arch support is not great for my flat feet. The ride is smooth though." },
        { rating: 4, review: "Excellent build quality. Easy to pitch even in wind. Ventilation could be slightly better." },
        { rating: 4, review: "Very roomy for a 3-person tent. The vestibule space is generous and well designed." },
        { rating: 4, review: "Packs down incredibly small. The double-wall design keeps condensation at bay nicely." },
    ],
    charlie: [
        { rating: 5, review: "This vinyl brings back memories. The original 1969 pressing sounds absolutely magical." },
        { rating: 5, review: "Pink Floyd masterwork. The transitions between tracks are seamless on vinyl." },
        { rating: 3, review: "Good album but my copy has some surface noise. Still enjoyable for casual listening." },
        { rating: 4, review: "Found the perfect spot for this desk in my study. The drawers are surprisingly spacious." },
        { rating: 3, review: "Nice piece but arrived with a small chip on one corner. Seller was responsive about it." },
        { rating: 5, review: "This bookcase is magnificent. Georgian craftsmanship at its finest. Worth every penny." },
        { rating: 4, review: "Great for marathon training. The race predictor feature is surprisingly accurate." },
        { rating: 3, review: "Good watch but a bit bulky for smaller wrists. The tracking data is very detailed though." },
        { rating: 5, review: "Perfect size and weight. The touchscreen is very responsive even during workouts." },
        { rating: 3, review: "Comfortable but the sole wears down faster than I expected. Good for shorter runs." },
        { rating: 4, review: "Love the Primeknit upper. These are stylish enough for casual wear and great for running." },
        { rating: 5, review: "My favorite running shoe ever. The Fresh Foam provides the perfect balance of soft and responsive." },
        { rating: 4, review: "Great tent for the price. The freestanding design makes site selection much easier." },
        { rating: 5, review: "Incredible value. Used it for a week-long camping trip and it performed flawlessly." },
        { rating: 3, review: "Lightweight and well-made but the zippers can be finicky in cold weather." },
    ],
};

export async function GET() {
    const db = await getDb();

    // ── 1. Seed users ────────────────────────────────────
    const hashedPassword = await bcrypt.hash("test", 10);
    let usersCreated = 0;

    for (const u of SAMPLE_USERS) {
        const exists = await db.collection("users").findOne({ username: u.username });
        if (!exists) {
            await db.collection("users").insertOne({
                username: u.username,
                email: u.email,
                password: hashedPassword,
                role: u.role,
            });
            usersCreated++;
        }
    }

    // ── 2. Seed items ────────────────────────────────────
    const itemCount = await db.collection("items").countDocuments();
    let itemsCreated = 0;

    if (itemCount === 0) {
        await db.collection("items").insertMany(SAMPLE_ITEMS);
        itemsCreated = SAMPLE_ITEMS.length;
    }

    // ── 3. Seed ratings & reviews ────────────────────────
    // Get all item IDs (in insertion order)
    const allItems = await db.collection("items").find().toArray();
    let ratingsCreated = 0;
    let reviewsCreated = 0;

    for (const [username, reviewsList] of Object.entries(USER_REVIEWS)) {
        for (let i = 0; i < allItems.length && i < reviewsList.length; i++) {
            const itemId: ObjectId = allItems[i]._id as ObjectId;
            const { rating, review } = reviewsList[i];

            // Add rating if not already present
            const existingRating = await db.collection("ratings").findOne({ username, item_id: itemId });
            if (!existingRating) {
                await db.collection("ratings").insertOne({ username, item_id: itemId, rating });
                ratingsCreated++;
            }

            // Add review if not already present
            const existingReview = await db.collection("reviews").findOne({ username, item_id: itemId });
            if (!existingReview) {
                await db.collection("reviews").insertOne({
                    username,
                    item_id: itemId,
                    review,
                    rating,
                    created_at: new Date(),
                });
                reviewsCreated++;
            }
        }
    }

    // ── 4. Recalculate item averages based on actual ratings ──
    for (const item of allItems) {
        const itemId = item._id as ObjectId;
        const ratingsForItem = await db.collection("ratings").find({ item_id: itemId }).toArray();
        const count = ratingsForItem.length;
        if (count > 0) {
            const sum = ratingsForItem.reduce((acc, r) => acc + r.rating, 0);
            const avg = sum / count;
            await db.collection("items").updateOne(
                { _id: itemId },
                { $set: { rating: avg, number_of_reviewers: count } }
            );
        }
    }

    return NextResponse.json({
        status: "ok",
        message: `Seed complete. Users created: ${usersCreated}. Items created: ${itemsCreated}. Ratings created: ${ratingsCreated}. Reviews created: ${reviewsCreated}.`,
    }, { status: 201 });
}
