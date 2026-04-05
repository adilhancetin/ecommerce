import { Db, ObjectId } from "mongodb";

/**
 * Checks if a user has already rated an item.
 */
export async function checkRatingExists(db: Db, username: string, itemId: ObjectId) {
    const existing = await db.collection("ratings").findOne({ username, item_id: itemId });
    if (existing) {
        return { ok: false, message: "You have already rated this item" };
    }
    const item = await db.collection("items").findOne({ _id: itemId });
    if (!item) {
        return { ok: false, message: "Item not found" };
    }
    return { ok: true, message: "" };
}

/**
 * Inserts a rating and updates the item's running average.
 */
export async function addRating(db: Db, username: string, itemId: ObjectId, rating: number) {
    await db.collection("ratings").insertOne({ username, item_id: itemId, rating });

    const item = await db.collection("items").findOne({ _id: itemId });
    if (!item) return;

    const newCount = (item.number_of_reviewers ?? 0) + 1;
    const newRating = ((item.rating ?? 0) * (item.number_of_reviewers ?? 0) + rating) / newCount;

    await db.collection("items").updateOne(
        { _id: itemId },
        { $set: { rating: newRating, number_of_reviewers: newCount } }
    );
}

/**
 * Updates an existing rating and recalculates the item's average.
 */
export async function updateRating(db: Db, username: string, itemId: ObjectId, newRatingValue: number) {
    const existing = await db.collection("ratings").findOne({ username, item_id: itemId });
    if (!existing) return { ok: false, message: "Rating not found" };

    const oldRatingValue: number = existing.rating;

    await db.collection("ratings").updateOne(
        { username, item_id: itemId },
        { $set: { rating: newRatingValue } }
    );

    const item = await db.collection("items").findOne({ _id: itemId });
    if (!item) return { ok: true, message: "Rating updated" };

    const count = item.number_of_reviewers ?? 0;
    if (count > 0) {
        const newAvg = ((item.rating ?? 0) * count - oldRatingValue + newRatingValue) / count;
        await db.collection("items").updateOne(
            { _id: itemId },
            { $set: { rating: newAvg } }
        );
    }

    return { ok: true, message: "Rating updated" };
}

/**
 * Removes a user's rating and recalculates the item's average.
 */
export async function deleteRating(db: Db, username: string, itemId: ObjectId) {
    const ratingDoc = await db.collection("ratings").findOne({ username, item_id: itemId });
    if (!ratingDoc) return { ok: false, message: "Rating not found" };

    await db.collection("ratings").deleteOne({ username, item_id: itemId });

    const item = await db.collection("items").findOne({ _id: itemId });
    if (!item) return { ok: true, message: "Rating deleted" };

    const count = item.number_of_reviewers ?? 0;
    if (count <= 1) {
        await db.collection("items").updateOne(
            { _id: itemId },
            { $set: { rating: 0, number_of_reviewers: 0 } }
        );
    } else {
        const newCount = count - 1;
        const newRating = ((item.rating ?? 0) * count - ratingDoc.rating) / newCount;
        await db.collection("items").updateOne(
            { _id: itemId },
            { $set: { rating: newRating, number_of_reviewers: newCount } }
        );
    }

    return { ok: true, message: "Rating deleted" };
}