import { db } from "@/config/db";
import { courseTable, enrollCourseTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // 1️⃣ Read request body - Fixed parameter name
    const { courseId } = await req.json();

    // 2️⃣ Get logged-in user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;

    // 3️⃣ Check if already enrolled - Fixed parameter name
    const enrolled = await db
      .select()
      .from(enrollCourseTable)
      .where(
        and(
          eq(enrollCourseTable.cid, courseId),
          eq(enrollCourseTable.userEmail, userEmail)
        )
      );

    // 4️⃣ If not enrolled → insert - Fixed parameter name
    if (enrolled.length === 0) {
      const result = await db
        .insert(enrollCourseTable)
        .values({
          cid: courseId,
          userEmail: userEmail,
          completedChapters: []
        })
        .returning();

      return NextResponse.json(result);
    }

    // 5️⃣ Already enrolled
    return NextResponse.json({ message: "Already enrolled" });

  } catch (error) {
    console.error("Enroll course error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  const user =await currentUser();
  const result = await db.select().from(courseTable)
  .innerJoin(enrollCourseTable,eq(courseTable.cid,enrollCourseTable.cid))
  .where(eq(enrollCourseTable.userEmail,user?.primaryEmailAddress.emailAddress))
  .orderBy(desc(enrollCourseTable.id));
  return NextResponse.json(result);
}