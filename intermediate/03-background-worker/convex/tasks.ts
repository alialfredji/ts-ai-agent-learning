/**
 * Convex task management functions
 */

import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Enqueue a new task
 */
export const enqueueTask = mutation({
  args: {
    type: v.string(),
    data: v.any(),
    maxAttempts: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert('tasks', {
      type: args.type,
      data: args.data,
      status: 'pending',
      attempts: 0,
      maxAttempts: args.maxAttempts || 3,
      createdAt: Date.now(),
    });
    return taskId;
  },
});

/**
 * Get next pending task
 */
export const getNextTask = query({
  handler: async (ctx) => {
    return await ctx.db
      .query('tasks')
      .withIndex('by_status', (q) => q.eq('status', 'pending'))
      .first();
  },
});

/**
 * Update task status
 */
export const updateTaskStatus = mutation({
  args: {
    taskId: v.id('tasks'),
    status: v.string(),
    result: v.optional(v.any()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error('Task not found');

    const updates: any = {
      status: args.status,
    };

    if (args.status === 'processing') {
      updates.startedAt = Date.now();
      updates.attempts = task.attempts + 1;
    }

    if (args.status === 'completed') {
      updates.completedAt = Date.now();
      updates.result = args.result;
    }

    if (args.status === 'failed') {
      updates.completedAt = Date.now();
      updates.error = args.error;
    }

    await ctx.db.patch(args.taskId, updates);
  },
});

/**
 * Get task by ID
 */
export const getTask = query({
  args: { taskId: v.id('tasks') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.taskId);
  },
});

/**
 * List tasks
 */
export const listTasks = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query('tasks');

    if (args.status) {
      query = query.withIndex('by_status', (q) => q.eq('status', args.status));
    }

    const tasks = await query.collect();
    return tasks.slice(0, args.limit || 50);
  },
});
