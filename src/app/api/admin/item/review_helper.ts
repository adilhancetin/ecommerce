import { Db, ObjectId } from "mongodb";

/**
 * Called when an item is deleted.
 * For every user who rated that item:
 *  - removes the item's contribution from their average rating
 *  - decrements their total rated items count
 * Then deletes all ratings for that item.
 */
export async function recalculateUserRatingsOnItemDelete(db: Db, itemId: ObjectId) {
    // Find all ratings for this item
    const ratings = await db.collection("ratings").find({ item_id: itemId }).toArray();

    for (const ratingDoc of ratings) {
        const userId = ratingDoc.user_id;
        const ratingValue: number = ratingDoc.rating;

        // Get the user's current stats
        const user = await db.collection("users").findOne({ _id: userId });
        if (!user) continue;

        const totalRatedItems: number = user.total_rated_items ?? 0;
        const currentAvgRating: number = user.rating ?? 0;

        if (totalRatedItems <= 1) {
            // This was the only rated item — reset to 0
            await db.collection("users").updateOne(
                { _id: userId },
                { $set: { rating: 0, total_rated_items: 0 } }
            );
        } else {
            // Remove this item's rating from the average
            const totalScore = currentAvgRating * totalRatedItems;
            const newTotalScore = totalScore - ratingValue;
            const newTotalRatedItems = totalRatedItems - 1;
            const newAvgRating = newTotalScore / newTotalRatedItems;

            await db.collection("users").updateOne(
                { _id: userId },
                { $set: { rating: newAvgRating, total_rated_items: newTotalRatedItems } }
            );
        }
    }

    // Delete all ratings for this item
    await db.collection("ratings").deleteMany({ item_id: itemId });
}
