/**
 * Zod schemas for structured email triage output
 */

import { z } from 'zod';

export const triageEmailSchema = z.object({
  category: z.enum(['work', 'personal', 'promotional', 'spam', 'social', 'other']),
  priority: z.enum(['high', 'medium', 'low']),
  suggested_actions: z.array(z.enum(['reply', 'archive', 'flag', 'delete', 'forward'])),
  reasoning: z.string(),
  tags: z.array(z.string()),
  requires_immediate_attention: z.boolean(),
});

export type TriageResult = z.infer<typeof triageEmailSchema>;
