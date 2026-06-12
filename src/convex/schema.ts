import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  universities: defineTable({
    name: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
  }),

  users: defineTable({
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    isAdmin: v.optional(v.boolean()),

    universityId: v.optional(v.id("universities")),
  }).index("email", ["email"]),

  orders: defineTable({
    userId: v.id("users"),
    scarfType: v.union(
      v.literal("أمريكي جهتين تطريز"),
      v.literal("ملكي تطريز"),
    ),
    scarfName: v.string(),
    backText: v.optional(v.string()),
    backImageId: v.optional(v.id("_storage")),
    hatTextTop: v.optional(v.string()),
    hatTextSide: v.optional(v.string()),
    hatImageId: v.optional(v.id("_storage")),
    robeSize: v.union(
      v.literal("36"),
      v.literal("38"),
      v.literal("40"),
      v.literal("42"),
      v.literal("44"),
      v.literal("46"),
      v.literal("48"),
      v.literal("50"),
      v.literal("52"),
      v.literal("بدون روب"),
    ),
    robeSleeveLengthNote: v.optional(v.string()),
    certificateName: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});

export default schema;
