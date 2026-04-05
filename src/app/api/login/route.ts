import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    const db = await getDb();
    const { username, password } = await request.json();

    // 1. Find the user by username
    const user = await db.collection("users").findOne({ username });
    if (!user) {
        return NextResponse.json({
            status: "error",
            message: "Invalid username or password"
        }, { status: 401 });
    }

    // 2. Compare submitted password against the stored hash
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return NextResponse.json({
            status: "error",
            message: "Invalid username or password"
        }, { status: 401 });
    }

    // 3. Return success with basic user info
    // Note: For a real app you'd issue a JWT token here.
    // For now, the frontend can store the username in localStorage or a cookie.
    return NextResponse.json({
        status: "success",
        message: "Logged in successfully",
        user: { username: user.username, email: user.email, role: user.role ?? "user" }
    });
}