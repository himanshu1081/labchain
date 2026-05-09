import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  bookings: defineTable({
    bookingId: v.string(),
    walletAddress: v.string(),
    equipmentId: v.string(),
    duration: v.number(),
    depositAmount: v.string(),
    txHash: v.string(),
    approveTxHash: v.string(),
    status: v.string(),
    bookedAt: v.number(),
  }),
});
