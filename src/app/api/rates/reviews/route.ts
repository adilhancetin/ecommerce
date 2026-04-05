import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { checkReviewExists } from "./review_helper";

// GET /api/rates/reviews?item_id=... — get all reviews for an item
export async function GET(request: Request) {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("item_id");

    if (!itemId) {
        return NextResponse.json({ status: "error", message: "item_id is required" }, { status: 400 });
    }

    const reviews = await db.collection("reviews").find({ item_id: new ObjectId(itemId) }).toArray();
    return NextResponse.json({ status: "ok", reviews });
}

// POST /api/rates/reviews — submit a review (optionally with a rating)
export async function POST(request: Request) {
    const db = await getDb();
    const { username, item_id, review, rating } = await request.json();

    if (!username || !item_id || !review) {
        return NextResponse.json({ status: "error", message: "username, item_id and review are required" }, { status: 400 });
    }

    const itemId = new ObjectId(item_id);
    if (await checkReviewExists(db, username, itemId)) {
        return NextResponse.json({ status: "error", message: "You have already reviewed this item" }, { status: 409 });
    }

    await db.collection("reviews").insertOne({
        username,
        item_id: itemId,
        review,
        rating: rating ?? null,
        created_at: new Date(),
    });

    return NextResponse.json({ status: "ok", message: "Review submitted" }, { status: 201 });
}

// PUT /api/rates/reviews — update an existing review
export async function PUT(request: Request) {
    const db = await getDb();
    const { username, item_id, review, rating } = await request.json();

    if (!username || !item_id || !review) {
        return NextResponse.json({ status: "error", message: "username, item_id and review are required" }, { status: 400 });
    }

    const itemId = new ObjectId(item_id);
    const result = await db.collection("reviews").updateOne(
        { username, item_id: itemId },
        { $set: { review, rating: rating ?? null, updated_at: new Date() } }
    );

    if (result.matchedCount === 0) {
        return NextResponse.json({ status: "error", message: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ status: "ok", message: "Review updated" });
}

// DELETE /api/rates/reviews — delete a review
export async function DELETE(request: Request) {
    const db = await getDb();
    const { username, item_id } = await request.json();

    if (!username || !item_id) {
        return NextResponse.json({ status: "error", message: "username and item_id are required" }, { status: 400 });
    }

    const itemId = new ObjectId(item_id);
    const result = await db.collection("reviews").deleteOne({ username, item_id: itemId });

    if (result.deletedCount === 0) {
        return NextResponse.json({ status: "error", message: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ status: "ok", message: "Review deleted" });
}