/**
 * Unified Model Provider Abstraction
 *
 * This module provides a common interface for interacting with different AI model providers
 * (OpenAI, Anthropic, Google Gemini). It allows you to switch providers via environment
 * variables or programmatically.
 *
 * Usage:
 *   import { getModelProvider, ModelProvider } from '@lib/models/provider';
 *   const provider = getModelProvider();
 *   const response = await provider.complete({ messages, maxTokens: 1000 });
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionRequest {
  messages: Message[];
  maxTokens?: number;
  temperature?: number;
  stopSequences?: string[];
  tools?: any[]; // Tool definitions
}

export interface CompletionResponse {
  content: string;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'error';
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  toolCalls?: any[];
}

export interface ModelProvider {
  name: string;
  complete(request: CompletionRequest): Promise<CompletionResponse>;
  streamComplete?(request: CompletionRequest): AsyncGenerator<string, void, unknown>;
}

/**
 * OpenAI Provider
 */
export class OpenAIProvider implements ModelProvider {
  name = 'openai';
  private client: OpenAI;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
    this.model = model || process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const { messages, maxTokens, temperature, stopSequences, tools } = request;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: messages as any,
      max_tokens: maxTokens,
      temperature,
      stop: stopSequences,
      tools: tools as any,
    });

    const choice = response.choices[0];
    const message = choice.message;

    return {
      content: message.content || '',
      finishReason: choice.finish_reason as any,
      usage: {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      toolCalls: message.tool_calls,
    };
  }

  async *streamComplete(request: CompletionRequest): AsyncGenerator<string, void, unknown> {
    const { messages, maxTokens, temperature, stopSequences } = request;

    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: messages as any,
      max_tokens: maxTokens,
      temperature,
      stop: stopSequences,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        yield delta;
      }
    }
  }
}

/**
 * Anthropic Provider
 */
export class AnthropicProvider implements ModelProvider {
  name = 'anthropic';
  private client: Anthropic;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
    this.model = model || process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229';
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const { messages, maxTokens, temperature, stopSequences, tools } = request;

    // Extract system message if present
    const systemMessage = messages.find((m) => m.role === 'system')?.content || '';
    const nonSystemMessages = messages.filter((m) => m.role !== 'system');

    // Note: tools parameter requires newer Anthropic SDK version
    const createParams: any = {
      model: this.model,
      system: systemMessage,
      messages: nonSystemMessages,
      max_tokens: maxTokens || 4096,
      temperature,
      stop_sequences: stopSequences,
    };

    if (tools) {
      createParams.tools = tools;
    }

    const response = await this.client.messages.create(createParams);

    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '';

    return {
      content: text,
      finishReason: response.stop_reason === 'end_turn' ? 'stop' : (response.stop_reason as any),
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      toolCalls: response.content.filter((c: any) => c.type === 'tool_use'),
    };
  }

  async *streamComplete(request: CompletionRequest): AsyncGenerator<string, void, unknown> {
    const { messages, maxTokens, temperature, stopSequences } = request;

    const systemMessage = messages.find((m) => m.role === 'system')?.content || '';
    const nonSystemMessages = messages.filter((m) => m.role !== 'system');

    const stream = await this.client.messages.create({
      model: this.model,
      system: systemMessage,
      messages: nonSystemMessages as any,
      max_tokens: maxTokens || 4096,
      temperature,
      stop_sequences: stopSequences,
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield chunk.delta.text;
      }
    }
  }
}

/**
 * Google Gemini Provider
 */
export class GoogleProvider implements ModelProvider {
  name = 'google';
  private client: GoogleGenAI;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.client = new GoogleGenAI({ apiKey: apiKey || process.env.GOOGLE_API_KEY || '' });
    this.model = model || process.env.GOOGLE_MODEL || 'gemini-2.0-flash-001';
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const { messages, maxTokens, temperature, stopSequences } = request;

    // Convert messages to Gemini format
    const systemMessage = messages.find((m) => m.role === 'system')?.content;
    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    // Validate we have at least one non-system message
    if (contents.length === 0) {
      throw new Error('No messages to process. At least one non-system message is required.');
    }

    // Prepend system message to first user message if present
    if (systemMessage && contents.length > 0 && contents[0].role === 'user') {
      contents[0].parts[0].text = `${systemMessage}\n\n${contents[0].parts[0].text}`;
    }

    const result = await this.client.models.generateContent({
      model: this.model,
      contents: contents as any,
      config: {
        maxOutputTokens: maxTokens,
        temperature,
        stopSequences,
      },
    });

    const text = result.text || '';

    // Note: Gemini doesn't provide detailed token counts in all cases
    return {
      content: text,
      finishReason: 'stop',
      usage: {
        inputTokens: 0, // Not readily available
        outputTokens: 0, // Not readily available
        totalTokens: 0,
      },
    };
  }

  async *streamComplete(request: CompletionRequest): AsyncGenerator<string, void, unknown> {
    const { messages, maxTokens, temperature, stopSequences } = request;

    const systemMessage = messages.find((m) => m.role === 'system')?.content;
    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    // Prepend system message to first user message if present
    if (systemMessage && contents.length > 0 && contents[0].role === 'user') {
      contents[0].parts[0].text = `${systemMessage}\n\n${contents[0].parts[0].text}`;
    }

    const response = await this.client.models.generateContentStream({
      model: this.model,
      contents: contents as any,
      config: {
        maxOutputTokens: maxTokens,
        temperature,
        stopSequences,
      },
    });

    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  }
}

/**
 * Get model provider based on environment configuration
 */
export function getModelProvider(providerName?: string): ModelProvider {
  const provider = providerName || process.env.MODEL_PROVIDER || 'openai';

  switch (provider.toLowerCase()) {
    case 'openai':
      return new OpenAIProvider();
    case 'anthropic':
      return new AnthropicProvider();
    case 'google':
    case 'gemini':
      return new GoogleProvider();
    default:
      throw new Error(
        `Unknown model provider: ${provider}. Valid options: openai, anthropic, google`
      );
  }
}

/**
 * Example usage
 */
export async function exampleUsage() {
  // Use default provider from environment
  const provider = getModelProvider();

  // Or specify explicitly
  // const provider = new OpenAIProvider();
  // const provider = new AnthropicProvider();
  // const provider = new GoogleProvider();

  const response = await provider.complete({
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'What is the capital of France?' },
    ],
    maxTokens: 100,
    temperature: 0.7,
  });

  console.log(`Provider: ${provider.name}`);
  console.log(`Response: ${response.content}`);
  console.log(`Tokens used: ${response.usage.totalTokens}`);
}
