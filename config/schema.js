import { boolean } from "drizzle-orm/gel-core";
import { integer, json, pgTable, varchar } from "drizzle-orm/pg-core";
import { SubscriptIcon } from "lucide-react";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  SubscriptId :varchar(),
});

export const courseTable = pgTable("courses",{
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  cid: varchar().notNull(), 
    name:varchar(),
    description:varchar(),
    chapter:integer().notNull(),
    includevideo:boolean().default(false),
    category:varchar(),
    level:varchar().notNull(),
    courseJson:json(),
    userEmail: varchar('userEmail').references(()=>usersTable.email).notNull()
})