import { db } from "@/config/db";
import { courseTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req) {
    const {searchParams}=new URL(req.url);
    const courseId= searchParams.get('courseId')
    const result = await db.select().from(courseTable)
        .where(eq(courseTable.cid,courseId));
        console.log(result);
    return NextResponse.json(result[0]);
}