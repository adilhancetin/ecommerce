import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { checkRatingExists, addRating, updateRating, deleteRating } from "./rating_helper";

// GET /api/rates/rating?item_id=...
export async function GET(request: Request) {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("item_id");

    if (!itemId) {
        return NextResponse.json({ status: "error", message: "item_id is required" }, { status: 400 });
    }

    const ratings = await db.collection("ratings").find({ item_id: new ObjectId(itemId) }).toArray();
    return NextResponse.json({ status: "ok", ratings });
}

// POST /api/rates/rating — submit a new rating
export async function POST(request: Request) {
    const db = await getDb();
    const { username, item_id, rating } = await request.json();

    if (!username || !item_id || rating == null) {
        return NextResponse.json({ status: "error", message: "username, item_id and rating are required" }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
        return NextResponse.json({ status: "error", message: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const itemId = new ObjectId(item_id);
    const { ok, message } = await checkRatingExists(db, username, itemId);
    if (!ok) {
        return NextResponse.json({ status: "error", message }, { status: 409 });
    }

    await addRating(db, username, itemId, rating);
    return NextResponse.json({ status: "ok", message: "You have rated this item" });
}

// PUT /api/rates/rating — update an existing rating
export async function PUT(request: Request) {
    const db = await getDb();
    const { username, item_id, rating } = await request.json();

    if (!username || !item_id || rating == null) {
        return NextResponse.json({ status: "error", message: "username, item_id and rating are required" }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
        return NextResponse.json({ status: "error", message: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const itemId = new ObjectId(item_id);
    const result = await updateRating(db, username, itemId, rating);

    if (!result.ok) {
        return NextResponse.json({ status: "error", message: result.message }, { status: 404 });
    }
    return NextResponse.json({ status: "ok", message: result.message });
}

// DELETE /api/rates/rating — remove a rating
export async function DELETE(request: Request) {
    const db = await getDb();
    const { username, item_id } = await request.json();

    if (!username || !item_id) {
        return NextResponse.json({ status: "error", message: "username and item_id are required" }, { status: 400 });
    }

    const itemId = new ObjectId(item_id);
    const result = await deleteRating(db, username, itemId);

    if (!result.ok) {
        return NextResponse.json({ status: "error", message: result.message }, { status: 404 });
    }
    return NextResponse.json({ status: "ok", message: result.message });
}