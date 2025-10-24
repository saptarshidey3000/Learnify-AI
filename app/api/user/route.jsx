import { usersTable } from "@/config/schema";
import { db } from "@/config/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, name } = await req.json();

    // check if user exists
    const users = await db.select().from(usersTable).where(eq(usersTable.email, email));

    if (users.length === 0) {
      // insert new user
      const result = await db
        .insert(usersTable)
        .values({ name, email })
        .returning();

      console.log("✅ User created:", result);
      return NextResponse.json(result);
    }

    console.log("⚠️ User already exists");
    return NextResponse.json({ message: "User already exists" });
  } catch (error) {
    console.error("❌ Error creating user:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
