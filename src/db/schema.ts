import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";

import {
  pgTable,
  integer,
  text,
  jsonb,
  serial,
  timestamp,
  bigint,
  primaryKey,
} from "drizzle-orm/pg-core";

const advocates = pgTable("advocates", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  city: text("city").notNull(),
  degree: text("degree").notNull(),
  yearsOfExperience: integer("years_of_experience").notNull(),
  phoneNumber: bigint("phone_number", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

const specialties = pgTable("specialties", {
  id: serial("id").primaryKey(),
  specialtyName: text("specialty_name").notNull().unique(),
});

// Bridge table for many-to-many relationship between advocates and specialties
const advocateSpecialties = pgTable("advocate_specialties", {
  advocateId: integer("advocate_id")
    .notNull()
    .references(() => advocates.id, { onDelete: "cascade" }),
  specialtyId: integer("specialty_id")
    .notNull()
    .references(() => specialties.id, { onDelete: "cascade" }),
  },
  (table) => ({pk: primaryKey({columns: [table.advocateId, table.specialtyId] })})
);

// Relationships
const advocateRelations = relations(advocates, ({ many }) => ({
  advocateToSpecialties: many(advocateSpecialties),
}));

const specialtiesRelations = relations(specialties, ({ many }) => ({
  specialtyToAdvocates: many(advocateSpecialties),
}));

const advocatesToSpecialtiesRelations = relations(advocateSpecialties, ({ one }) => ({
  advocate: one(advocates, {
    fields: [advocateSpecialties.advocateId],
    references: [advocates.id],
  }),
  specialties: one(specialties, {
    fields: [advocateSpecialties.specialtyId],
    references: [specialties.id],
  }),
}));

export { advocates, specialties, advocateSpecialties, advocateRelations, specialtiesRelations, advocatesToSpecialtiesRelations };
