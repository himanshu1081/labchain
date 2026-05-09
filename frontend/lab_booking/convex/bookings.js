import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveBooking = mutation({
  args: {
    bookingId: v.string(),
    walletAddress: v.string(),
    equipmentId: v.string(),
    duration: v.number(),
    depositAmount: v.string(),
    txHash: v.string(),
    approveTxHash: v.string(),
    status: v.string(),
    bookedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("bookings", args);
  },
});

export const getBookings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("bookings").order("desc").collect();
  },
});

export const getBookingByTxHash = query({
  args: { txHash: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .filter((q) => q.eq(q.field("txHash"), args.txHash))
      .first();
  },
});
