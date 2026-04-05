import { getDb } from "@/lib/mongodb";
import { Db, ObjectId } from "mongodb";

/**
 * Called when a user is deleted.
 * For every item the user has rated:
 *  - removes their rating from that item's average
 *  - decrements the item's number_of_reviewers
 * Then deletes all their ratings and reviews.
 */
export async function deleteRatingsAndReviews(db: Db, userId: ObjectId) {
    // Find all ratings this user has submitted
    const ratings = await db.collection("ratings").find({ user_id: userId }).toArray();

    for (const rating of ratings) {
        const itemId: ObjectId = rating.item_id;
        const ratingValue: number = rating.rating;

        const item = await db.collection("items").findOne({ _id: itemId });
        if (!item) continue;

        const numReviewers: number = item.number_of_reviewers ?? 0;
        const currentRating: number = item.rating ?? 0;

        if (numReviewers <= 1) {
            // This user was the only reviewer — reset
            await db.collection("items").updateOne(
                { _id: itemId },
                { $set: { rating: 0, number_of_reviewers: 0 } }
            );
        } else {
            const newNumReviewers = numReviewers - 1;
            const newRating = (currentRating * numReviewers - ratingValue) / newNumReviewers;
            await db.collection("items").updateOne(
                { _id: itemId },
                { $set: { rating: newRating, number_of_reviewers: newNumReviewers } }
            );
        }
    }

    // Delete all ratings and reviews left by this user
    await db.collection("ratings").deleteMany({ user_id: userId });
    await db.collection("reviews").deleteMany({ user_id: userId });
}