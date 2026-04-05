import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { deleteRatingsAndReviews } from "./user_helper";

// POST /api/admin/user — create a user with a specific role (e.g. "admin", "user")
export async function POST(request: Request) {
    const db = await getDb();
    const { username, email, password, role } = await request.json();

    const exists = await db.collection("users").findOne({
        $or: [{ username }, { email }]
    });
    if (exists) {
        return NextResponse.json({
            status: "error",
            message: "Username or email already exists"
        }, { status: 409 });
    }

    const hashed_password = await bcrypt.hash(password, 10);
    await db.collection("users").insertOne({ username, email, password: hashed_password, role: role ?? "user" });

    return NextResponse.json({
        status: "ok",
        message: `User "${username}" created`
    }, { status: 201 });
}

// GET /api/admin/user — list all users (password excluded)
export async function GET() {
    const db = await getDb();
    const users = await db.collection("users").find({}, { projection: { password: 0 } }).toArray();
    return NextResponse.json({ status: "ok", users });
}

// DELETE /api/admin/user — delete a user and clean up all their ratings/reviews
export async function DELETE(request: Request) {
    const db = await getDb();
    const { id } = await request.json();
    const objectId = new ObjectId(id);

    const result = await db.collection("users").deleteOne({ _id: objectId });
    if (result.deletedCount === 0) {
        return NextResponse.json({ status: "error", message: "User not found" }, { status: 404 });
    }

    // Remove all ratings and reviews by this user, and update affected items' averages
    await deleteRatingsAndReviews(db, objectId);

    return NextResponse.json({ status: "ok", message: "User deleted" });
}
