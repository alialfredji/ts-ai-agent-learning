/**
 * Inbox Triager Agent
 *
 * Categorizes and prioritizes emails using structured outputs.
 */

import { getModelProvider } from '../../src/lib/models/provider.js';
import { triageEmailSchema, type TriageResult } from './schemas.js';
import { sampleEmails } from './sample-emails.js';

async function triageEmail(email: {
  subject: string;
  from: string;
  body: string;
  timestamp: string;
}): Promise<TriageResult> {
  const provider = getModelProvider();

  const prompt = `You are an email triaging assistant. Analyze the following email and provide categorization, priority, and suggested actions.

Email:
From: ${email.from}
Subject: ${email.subject}
Date: ${email.timestamp}
Body: ${email.body}

Respond with a JSON object matching this schema:
{
  "category": "work" | "personal" | "promotional" | "spam" | "social" | "other",
  "priority": "high" | "medium" | "low",
  "suggested_actions": ["reply", "archive", "flag", "delete", "forward"],
  "reasoning": "brief explanation",
  "tags": ["tag1", "tag2"],
  "requires_immediate_attention": boolean
}`;

  const response = await provider.complete({
    messages: [
      {
        role: 'system',
        content:
          'You are an expert email triaging assistant. Analyze emails and provide structured triage information.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    maxTokens: 500,
    temperature: 0.3,
  });

  // Parse and validate the response
  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return triageEmailSchema.parse(parsed);
  } catch (error) {
    console.error('Failed to parse response:', response.content);
    throw error;
  }
}

async function main() {
  console.log('📧 Inbox Triager Agent\n');
  console.log(`Processing ${sampleEmails.length} sample emails...\n`);

  const results: Array<{ email: any; triage: TriageResult }> = [];

  for (const email of sampleEmails) {
    console.log(`\n📨 Triaging: "${email.subject}"`);
    console.log(`   From: ${email.from}\n`);

    const triage = await triageEmail(email);

    console.log(`   Category: ${triage.category}`);
    console.log(`   Priority: ${triage.priority}`);
    console.log(`   Actions: ${triage.suggested_actions.join(', ')}`);
    console.log(`   Tags: ${triage.tags.join(', ')}`);
    console.log(`   Urgent: ${triage.requires_immediate_attention ? 'YES' : 'No'}`);
    console.log(`   Reasoning: ${triage.reasoning}`);

    results.push({ email, triage });
  }

  // Summary
  console.log('\n\n📊 Summary:');
  const highPriority = results.filter((r) => r.triage.priority === 'high').length;
  const urgent = results.filter((r) => r.triage.requires_immediate_attention).length;

  console.log(`   Total emails: ${results.length}`);
  console.log(`   High priority: ${highPriority}`);
  console.log(`   Requires immediate attention: ${urgent}`);

  const categoryCounts = results.reduce(
    (acc, r) => {
      acc[r.triage.category] = (acc[r.triage.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  console.log('\n   By category:');
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    console.log(`     ${cat}: ${count}`);
  });
}

main().catch(console.error);
