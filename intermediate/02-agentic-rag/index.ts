/**
 * Agentic RAG with Critique-Refine Loop
 */

import { getModelProvider } from '../../src/lib/models/provider.js';

interface AgenticRAGResult {
  answer: string;
  confidence: number;
  iterationCount: number;
  hallucinationsDetected: boolean;
  refinementLog: string[];
}

/**
 * Mock retrieval function (in production, use actual vector store)
 */
async function retrieve(_query: string): Promise<string[]> {
  // Mock context documents
  return [
    'RAG (Retrieval-Augmented Generation) enhances LLMs by providing relevant context from external knowledge sources.',
    'Benefits of RAG include: reduced hallucinations, up-to-date information, domain-specific knowledge, and cost-effectiveness.',
    'RAG systems typically use vector embeddings and similarity search to find relevant documents.',
  ];
}

/**
 * Generate answer from context
 */
async function generateAnswer(query: string, context: string[]): Promise<string> {
  const provider = getModelProvider();

  const contextText = context.map((doc, i) => `[${i + 1}] ${doc}`).join('\n\n');

  const response = await provider.complete({
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful assistant. Answer questions based ONLY on the provided context. Include citation numbers [1], [2], etc.',
      },
      {
        role: 'user',
        content: `Context:\n${contextText}\n\nQuestion: ${query}\n\nAnswer:`,
      },
    ],
    maxTokens: 500,
  });

  return response.content;
}

/**
 * Critique the answer
 */
async function critiqueAnswer(
  query: string,
  answer: string,
  context: string[]
): Promise<{ satisfactory: boolean; feedback: string; confidence: number }> {
  const provider = getModelProvider();

  const contextText = context.join('\n');

  const response = await provider.complete({
    messages: [
      {
        role: 'system',
        content:
          'You are an answer quality evaluator. Check if the answer is accurate, complete, and grounded in the context.',
      },
      {
        role: 'user',
        content: `Question: ${query}\n\nContext:\n${contextText}\n\nAnswer: ${answer}\n\nEvaluate this answer. Respond in JSON format:
{
  "satisfactory": true/false,
  "confidence": 0.0-1.0,
  "feedback": "explanation of issues or confirmation of quality",
  "hallucinations": ["list any claims not in context"],
  "missing_info": ["list any missing important points"]
}`,
      },
    ],
    maxTokens: 500,
    temperature: 0.3,
  });

  const jsonMatch = response.content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { satisfactory: true, feedback: 'Unable to parse critique', confidence: 0.7 };
  }

  const critique = JSON.parse(jsonMatch[0]);
  return {
    satisfactory: critique.satisfactory,
    feedback: critique.feedback,
    confidence: critique.confidence || 0.7,
  };
}

/**
 * Agentic RAG with critique-refine loop
 */
export async function agenticRAG(
  query: string,
  maxIterations: number = 3
): Promise<AgenticRAGResult> {
  const refinementLog: string[] = [];
  let currentQuery = query;
  let answer = '';
  let confidence = 0;
  let iteration = 0;

  for (iteration = 0; iteration < maxIterations; iteration++) {
    console.log(`\n🔄 Iteration ${iteration + 1}/${maxIterations}`);

    // Retrieve relevant documents
    console.log('  📚 Retrieving context...');
    const context = await retrieve(currentQuery);

    // Generate answer
    console.log('  ✍️ Generating answer...');
    answer = await generateAnswer(currentQuery, context);
    console.log(`  Answer: ${answer.substring(0, 100)}...`);

    // Critique the answer
    console.log('  🔍 Critiquing answer...');
    const critique = await critiqueAnswer(currentQuery, answer, context);
    confidence = critique.confidence;

    refinementLog.push(
      `Iteration ${iteration + 1}: Confidence ${confidence.toFixed(2)} - ${critique.feedback}`
    );

    console.log(`  Confidence: ${confidence.toFixed(2)}`);
    console.log(`  Feedback: ${critique.feedback}`);

    if (critique.satisfactory && confidence >= 0.8) {
      console.log('  ✅ Answer satisfactory!');
      break;
    }

    if (iteration < maxIterations - 1) {
      console.log('  🔧 Refining query for next iteration...');
      // In a real system, use critique feedback to refine the query
      currentQuery = `${query} (focusing on: ${critique.feedback.substring(0, 50)})`;
    }
  }

  return {
    answer,
    confidence,
    iterationCount: iteration + 1,
    hallucinationsDetected: confidence < 0.7,
    refinementLog,
  };
}

async function main() {
  const query = process.argv[2] || 'What are the benefits of RAG?';

  console.log('🤖 Agentic RAG with Critique-Refine Loop');
  console.log(`Query: ${query}`);

  const result = await agenticRAG(query);

  console.log('\n' + '='.repeat(80));
  console.log('FINAL ANSWER');
  console.log('='.repeat(80));
  console.log(result.answer);

  console.log('\n' + '='.repeat(80));
  console.log('QUALITY METRICS');
  console.log('='.repeat(80));
  console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
  console.log(`Iterations: ${result.iterationCount}`);
  console.log(`Hallucinations: ${result.hallucinationsDetected ? 'Detected' : 'None'}`);

  console.log('\nRefinement Log:');
  result.refinementLog.forEach((log) => console.log(`  - ${log}`));
}

main().catch(console.error);
