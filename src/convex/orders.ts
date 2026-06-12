import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("غير مسجل الدخول");
  const user = await ctx.db.get(userId);
  if (!user?.isAdmin) throw new ConvexError("غير مصرح");
  return userId;
}

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await getAuthUserId(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const submitOrder = mutation({
  args: {
    scarfType: v.union(
      v.literal("أمريكي جهتين تطريز"),
      v.literal("ملكي تطريز"),
    ),
    scarfName: v.string(),
    backText: v.optional(v.string()),
    backImageStorageId: v.optional(v.id("_storage")),
    hatTextTop: v.optional(v.string()),
    hatTextSide: v.optional(v.string()),
    hatImageStorageId: v.optional(v.id("_storage")),
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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("غير مسجل الدخول");

    const existingOrder = await ctx.db
      .query("orders")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .order("desc")
      .first();

    const { backImageStorageId, hatImageStorageId, ...rest } = args;
    const orderData = {
      ...rest,
      backImageId: backImageStorageId,
      hatImageId: hatImageStorageId,
    };

    if (existingOrder) {
      await ctx.db.patch(existingOrder._id, orderData);
      return existingOrder._id;
    } else {
      return await ctx.db.insert("orders", {
        userId,
        ...orderData,
        createdAt: Date.now(),
      });
    }
  },
});

export const getMyOrder = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .order("desc")
      .first();
  },
});

// ── Admin only ────────────────────────────────────────────────────────────────

export const getAllOrdersAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const orders = await ctx.db.query("orders").order("desc").collect();

    const enriched = await Promise.all(
      orders.map(async (order) => {
        const user = await ctx.db.get(order.userId);
        const backImageUrl = order.backImageId
          ? await ctx.storage.getUrl(order.backImageId)
          : null;
        const hatImageUrl = order.hatImageId
          ? await ctx.storage.getUrl(order.hatImageId)
          : null;
        return { ...order, user, backImageUrl, hatImageUrl };
      }),
    );

    return enriched;
  },
});
