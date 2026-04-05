import { getDb } from "@/lib/mongodb";
import { Db } from "mongodb";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

async function checkUserExists(db: Db, chosen_username: string) {
    return db.collection("users").findOne({ username: chosen_username });
}

async function checkMailExists(db: Db, chosen_email: string) {
    return db.collection("users").findOne({ email: chosen_email });
}

async function hashPassword(password: string) {
    return bcrypt.hash(password, 10); // 10 = salt rounds
}

export async function POST(request: Request) {
    const db = await getDb();
    const { role, username, email, password } = await request.json();

    if ((await checkUserExists(db, username)) || (await checkMailExists(db, email))) {
        return NextResponse.json({
            status: "error",
            message: "Username or email already exists. Please try again"
        }, { status: 409 });
    }

    const hashed_password = await hashPassword(password);
    await db.collection("users").insertOne({ role: role, username: username, email: email, password: hashed_password });

    // No redirect here — the API just returns success.
    // The frontend decides where to navigate (e.g. to the login page).
    return NextResponse.json({
        status: "success",
        message: "Your account has been created, happy shopping!"
    }, { status: 201 });
}