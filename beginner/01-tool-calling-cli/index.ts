/**
 * Tool Calling CLI Agent
 * 
 * A simple command-line agent that demonstrates function calling with multiple tools.
 */

import { z } from 'zod';
import { getModelProvider } from '../../src/lib/models/provider.js';
import { tools, executeTool } from './tools.js';

async function runAgent() {
  const provider = getModelProvider();
  console.log(`🤖 Tool Calling CLI Agent (using ${provider.name})`);
  console.log('Ask me anything! I have access to tools like calculator, weather, and files.');
  console.log('---\n');

  const messages = [
    {
      role: 'system' as const,
      content:
        'You are a helpful assistant with access to various tools. ' +
        'Use the provided tools when needed to answer user questions accurately.',
    },
  ];

  // Example user query
  const userQuery = "What's the weather in San Francisco? Also, calculate 15 * 24.";
  console.log(`User: ${userQuery}\n`);

  messages.push({
    role: 'user' as const,
    content: userQuery,
  });

  // Get completion with tools
  const response = await provider.complete({
    messages,
    tools: tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    })),
    maxTokens: 1000,
  });

  // Handle tool calls
  if (response.toolCalls && response.toolCalls.length > 0) {
    console.log('🔧 Tool calls detected:\n');

    for (const toolCall of response.toolCalls) {
      const toolName = toolCall.function?.name || toolCall.name;
      const toolArgs =
        typeof toolCall.function?.arguments === 'string'
          ? JSON.parse(toolCall.function.arguments)
          : toolCall.input;

      console.log(`  - ${toolName}(${JSON.stringify(toolArgs)})`);

      const result = await executeTool(toolName, toolArgs);
      console.log(`    Result: ${JSON.stringify(result)}\n`);

      // Add tool result to messages
      messages.push({
        role: 'assistant' as const,
        content: `Tool ${toolName} returned: ${JSON.stringify(result)}`,
      });
    }

    // Get final response after tool execution
    const finalResponse = await provider.complete({
      messages,
      maxTokens: 500,
    });

    console.log(`\n🤖 Assistant: ${finalResponse.content}\n`);
    console.log(
      `📊 Usage: ${finalResponse.usage.totalTokens} tokens (in: ${finalResponse.usage.inputTokens}, out: ${finalResponse.usage.outputTokens})`
    );
  } else {
    console.log(`🤖 Assistant: ${response.content}\n`);
  }
}

// Run the agent
runAgent().catch(console.error);
