import { boolean } from "drizzle-orm/pg-core";
import { integer, json, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  SubscriptId: varchar(),
});

export const courseTable = pgTable("courses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  cid: varchar().notNull().unique(),
  name: varchar(),
  description: varchar(),
  chapter: integer().notNull(),
  includevideo: boolean().default(false),
  category: varchar(),
  level: varchar().notNull(),
  courseJson: json(),
  coursecontent: json(), // New column to store the complete content JSON
  userEmail: varchar('userEmail').references(() => usersTable.email).notNull(),
  bannerImageurl: varchar().default(''),
  createdAt: timestamp().defaultNow(),
});

export const enrollCourseTable=pgTable('enrollCourse',{
  id : integer().primaryKey().generatedAlwaysAsIdentity(),
  cid : varchar('cid').references(()=>courseTable.cid),
  userEmail: varchar('userEmail').references(()=> usersTable.email).notNull(),
  completedChapters: json()
})
