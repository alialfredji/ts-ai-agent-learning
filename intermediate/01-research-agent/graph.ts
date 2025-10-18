/**
 * LangGraph state machine for research agent
 */

import { StateGraph, END } from '@langchain/langgraph';
import { getModelProvider } from '../../src/lib/models/provider.js';

export interface ResearchState {
  query: string;
  plan?: string[];
  searchResults?: Array<{ title: string; url: string; snippet: string }>;
  extractedInfo?: string[];
  report?: string;
  citations?: string[];
  currentStep?: string;
}

/**
 * Node: Plan Research
 */
async function planResearch(state: ResearchState): Promise<Partial<ResearchState>> {
  console.log('📋 Planning research...');

  const provider = getModelProvider();

  const response = await provider.complete({
    messages: [
      {
        role: 'system',
        content:
          'You are a research planning assistant. Given a query, break it down into specific search queries.',
      },
      {
        role: 'user',
        content: `Query: ${state.query}\n\nProvide 3-5 specific search queries to answer this comprehensively. Return as JSON array: ["query1", "query2", ...]`,
      },
    ],
    maxTokens: 300,
  });

  const jsonMatch = response.content.match(/\[[\s\S]*\]/);
  const plan = jsonMatch ? JSON.parse(jsonMatch[0]) : [state.query];

  return { plan, currentStep: 'search' };
}

/**
 * Node: Execute Searches
 */
async function executeSearches(state: ResearchState): Promise<Partial<ResearchState>> {
  console.log(`🔍 Executing ${state.plan?.length || 0} searches...`);

  // Mock search results (replace with real search API)
  const searchResults = state.plan?.flatMap((query) => [
    {
      title: `Result 1 for ${query}`,
      url: `https://example.com/1`,
      snippet: `This is a mock search result for the query: ${query}. In production, integrate with Tavily, SerpAPI, or Google Custom Search.`,
    },
    {
      title: `Result 2 for ${query}`,
      url: `https://example.com/2`,
      snippet: `Another mock result about ${query}. Real implementation would fetch actual web content.`,
    },
  ]);

  return { searchResults, currentStep: 'extract' };
}

/**
 * Node: Extract Information
 */
async function extractInformation(state: ResearchState): Promise<Partial<ResearchState>> {
  console.log('📊 Extracting information from results...');

  const provider = getModelProvider();

  const resultsText = state.searchResults
    ?.map((r) => `Title: ${r.title}\nURL: ${r.url}\nContent: ${r.snippet}`)
    .join('\n\n');

  const response = await provider.complete({
    messages: [
      {
        role: 'system',
        content:
          'You are an information extraction assistant. Extract key facts from search results.',
      },
      {
        role: 'user',
        content: `Original Query: ${state.query}\n\nSearch Results:\n${resultsText}\n\nExtract key facts as bullet points. Include source URLs.`,
      },
    ],
    maxTokens: 800,
  });

  const extractedInfo = response.content.split('\n').filter((line) => line.trim());

  return { extractedInfo, currentStep: 'synthesize' };
}

/**
 * Node: Synthesize Report
 */
async function synthesizeReport(state: ResearchState): Promise<Partial<ResearchState>> {
  console.log('✍️ Synthesizing final report...');

  const provider = getModelProvider();

  const factsText = state.extractedInfo?.join('\n');

  const response = await provider.complete({
    messages: [
      {
        role: 'system',
        content:
          'You are a research report writer. Synthesize information into a clear, well-structured report with citations.',
      },
      {
        role: 'user',
        content: `Original Query: ${state.query}\n\nExtracted Facts:\n${factsText}\n\nWrite a comprehensive report. Include inline citations like [1], [2]. Then list citations at the end.`,
      },
    ],
    maxTokens: 1500,
  });

  // Extract citations
  const citationMatches = response.content.match(/\[\d+\].*?https?:\/\/[^\s)]+/g) || [];
  const citations = Array.from(new Set(citationMatches));

  return {
    report: response.content,
    citations,
    currentStep: 'done',
  };
}

/**
 * Create the research agent graph
 */
export function createResearchAgent() {
  const workflow = new StateGraph<ResearchState>({
    channels: {
      query: null,
      plan: null,
      searchResults: null,
      extractedInfo: null,
      report: null,
      citations: null,
      currentStep: null,
    },
  });

  // Add nodes
  workflow.addNode('plan', planResearch);
  workflow.addNode('search', executeSearches);
  workflow.addNode('extract', extractInformation);
  workflow.addNode('synthesize', synthesizeReport);

  // Define edges
  workflow.addEdge('__start__', 'plan');
  workflow.addEdge('plan', 'search');
  workflow.addEdge('search', 'extract');
  workflow.addEdge('extract', 'synthesize');
  workflow.addEdge('synthesize', END);

  return workflow.compile();
}
