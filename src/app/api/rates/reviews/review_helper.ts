import { Db, ObjectId } from "mongodb";

export async function checkReviewExists(db: Db, username: string, itemId: ObjectId) {
    const existing = await db.collection("reviews").findOne({ username, item_id: itemId });
    return !!existing;
}