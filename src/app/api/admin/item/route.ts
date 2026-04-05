import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { recalculateUserRatingsOnItemDelete } from "./review_helper";
import { NextResponse } from "next/server";

export async function GET() {
    const db = await getDb();
    return NextResponse.json({
        status: "ok",
        items: await db.collection("items").find().toArray()
    });
}

export async function POST(request: Request) {
    const db = await getDb();
    const { category, name, desc, price, seller, image, battery, age, size, material, condition } = await request.json();

    if (await db.collection("items").findOne({ name, seller })) {
        return NextResponse.json({
            status: "error",
            message: "The seller has the same named item. Please try again"
        }, { status: 409 });
    }

    const base = { name, desc, price, seller, image, condition, rating: 0, number_of_reviewers: 0 };

    if (category === "vinyls") {
        await db.collection("items").insertOne({ ...base, category: "vinyls", age });
    }
    else if (category === "antique") {
        await db.collection("items").insertOne({ ...base, category: "antique", age, material });
    }
    else if (category === "gps") {
        await db.collection("items").insertOne({ ...base, category: "gps", battery });
    }
    else if (category === "shoes") {
        await db.collection("items").insertOne({ ...base, category: "shoes", size, material });
    }
    else if (category === "tent") {
        await db.collection("items").insertOne({ ...base, category: "tent" });
    }
    else {
        await db.collection("items").insertOne({ ...base, category: "other" });
    }

    return NextResponse.json({
        status: "ok",
        message: `Item "${name}" added`
    }, { status: 201 });
}

export async function DELETE(request: Request) {
    const db = await getDb();
    const { id } = await request.json();
    const objectId = new ObjectId(id);

    const result = await db.collection("items").deleteOne({ _id: objectId });
    if (result.deletedCount === 0) {
        return NextResponse.json({ status: "error", message: "Item not found" }, { status: 404 });
    }

    // Recalculate affected users' ratings and clean up all ratings for this item
    await recalculateUserRatingsOnItemDelete(db, objectId);

    return NextResponse.json({ status: "ok", message: "Item deleted" });
}