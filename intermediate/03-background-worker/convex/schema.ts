/**
 * Convex schema for background worker
 */

import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  tasks: defineTable({
    type: v.string(),
    data: v.any(),
    status: v.string(), // 'pending' | 'processing' | 'completed' | 'failed'
    result: v.optional(v.any()),
    error: v.optional(v.string()),
    attempts: v.number(),
    maxAttempts: v.number(),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  }).index('by_status', ['status']),
});
