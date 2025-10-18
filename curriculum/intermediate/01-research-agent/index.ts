/**
 * Research Agent with LangGraph
 */

import { createResearchAgent } from './graph.js';

async function main() {
  const query = process.argv[2] || 'What are the latest developments in AI agents?';

  console.log('🔬 Research Agent');
  console.log(`Query: ${query}\n`);

  const agent = createResearchAgent();

  const result = await agent.invoke({
    query,
  });

  console.log('\n' + '='.repeat(80));
  console.log('RESEARCH REPORT');
  console.log('='.repeat(80) + '\n');

  console.log(result.report);

  console.log('\n' + '='.repeat(80));
  console.log('CITATIONS');
  console.log('='.repeat(80) + '\n');

  result.citations?.forEach((citation: string, i: number) => {
    console.log(`[${i + 1}] ${citation}`);
  });

  console.log('\n✅ Research complete!');
}

main().catch(console.error);
