/**
 * Multi-Agent PR Reviewer
 *
 * Orchestrates multiple specialized agents to review pull requests.
 */

import { trace, SpanStatusCode } from '@opentelemetry/api';
import { getModelProvider } from '../../../src/lib/models/provider.js';

const tracer = trace.getTracer('pr-reviewer');

interface PRContext {
  repo: string;
  prNumber: number;
  files: Array<{ filename: string; patch: string }>;
  description: string;
}

/**
 * Planner Agent - Creates review strategy
 */
async function plannerAgent(context: PRContext) {
  return tracer.startActiveSpan('planner-agent', async (span) => {
    try {
      const provider = getModelProvider();

      const response = await provider.complete({
        messages: [
          {
            role: 'system',
            content:
              'You are a PR review planning agent. Analyze the PR and create a review strategy.',
          },
          {
            role: 'user',
            content: `PR #${context.prNumber} in ${context.repo}\nDescription: ${context.description}\nFiles: ${context.files.map((f) => f.filename).join(', ')}\n\nCreate a review strategy with focus areas.`,
          },
        ],
        maxTokens: 500,
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return response.content;
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message });
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Code Reviewer Agent
 */
async function codeReviewerAgent(file: { filename: string; patch: string }) {
  return tracer.startActiveSpan('code-reviewer-agent', async (span) => {
    span.setAttribute('file', file.filename);

    try {
      const provider = getModelProvider();

      const response = await provider.complete({
        messages: [
          {
            role: 'system',
            content: 'You are a code review expert. Review the code changes and provide feedback.',
          },
          {
            role: 'user',
            content: `File: ${file.filename}\n\nChanges:\n${file.patch}\n\nProvide a code review with issues, suggestions, and a severity rating.`,
          },
        ],
        maxTokens: 1000,
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return {
        file: file.filename,
        review: response.content,
      };
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message });
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Main PR review orchestrator
 */
async function reviewPR(context: PRContext) {
  return tracer.startActiveSpan('review-pr', async (span) => {
    span.setAttribute('repo', context.repo);
    span.setAttribute('pr', context.prNumber);

    try {
      console.log(`🔍 Reviewing PR #${context.prNumber} in ${context.repo}\n`);

      // Step 1: Planning
      console.log('📋 Planning review strategy...');
      const strategy = await plannerAgent(context);
      console.log(`Strategy: ${strategy.substring(0, 100)}...\n`);

      // Step 2: Code review (parallel for all files)
      console.log('👨‍💻 Reviewing code changes...');
      const reviews = await Promise.all(context.files.map((file) => codeReviewerAgent(file)));

      // Step 3: Synthesize results
      console.log('\n📊 Review Results:\n');
      reviews.forEach((review) => {
        console.log(`File: ${review.file}`);
        console.log(review.review);
        console.log('\n' + '-'.repeat(80) + '\n');
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return { strategy, reviews };
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message });
      throw error;
    } finally {
      span.end();
    }
  });
}

// Example usage
async function main() {
  const mockPR: PRContext = {
    repo: 'owner/repo',
    prNumber: 123,
    description: 'Add new authentication feature',
    files: [
      {
        filename: 'src/auth.ts',
        patch: `
@@ -10,6 +10,12 @@ export function login(user: string, pass: string) {
+  // TODO: Add rate limiting
+  const token = generateToken(user);
+  return { success: true, token };
`,
      },
    ],
  };

  await reviewPR(mockPR);
}

main().catch(console.error);
