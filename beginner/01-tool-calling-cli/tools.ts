/**
 * Tool definitions with Zod schemas
 */

import { z } from 'zod';

// Calculator tool
export const calculatorSchema = z.object({
  operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
  a: z.number(),
  b: z.number(),
});

export function calculator(args: z.infer<typeof calculatorSchema>) {
  const { operation, a, b } = args;
  switch (operation) {
    case 'add':
      return a + b;
    case 'subtract':
      return a - b;
    case 'multiply':
      return a * b;
    case 'divide':
      if (b === 0) throw new Error('Division by zero');
      return a / b;
  }
}

// Weather tool (mock)
export const weatherSchema = z.object({
  location: z.string(),
});

export function getWeather(args: z.infer<typeof weatherSchema>) {
  const { location } = args;
  // Mock weather data
  const weatherData: Record<string, any> = {
    'san francisco': { temp: 65, condition: 'Foggy', humidity: 75 },
    'new york': { temp: 72, condition: 'Sunny', humidity: 60 },
    london: { temp: 58, condition: 'Rainy', humidity: 80 },
  };

  const data = weatherData[location.toLowerCase()];
  return (
    data || {
      temp: 70,
      condition: 'Unknown',
      humidity: 50,
      note: 'Mock data for ' + location,
    }
  );
}

// File listing tool (safe - only lists current directory)
export const listFilesSchema = z.object({
  directory: z.string().optional().default('.'),
});

export async function listFiles(args: z.infer<typeof listFilesSchema>) {
  const fs = await import('fs/promises');
  const path = await import('path');

  const { directory } = args;
  const safePath = path.resolve(directory);

  try {
    const files = await fs.readdir(safePath);
    return { directory: safePath, files: files.slice(0, 20) }; // Limit to 20 files
  } catch (error) {
    return { error: 'Unable to list files', directory: safePath };
  }
}

/**
 * Tool registry
 */
export const tools = [
  {
    name: 'calculator',
    description: 'Perform basic arithmetic operations (add, subtract, multiply, divide)',
    parameters: {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          enum: ['add', 'subtract', 'multiply', 'divide'],
          description: 'The operation to perform',
        },
        a: {
          type: 'number',
          description: 'First number',
        },
        b: {
          type: 'number',
          description: 'Second number',
        },
      },
      required: ['operation', 'a', 'b'],
    },
    execute: calculator,
    schema: calculatorSchema,
  },
  {
    name: 'get_weather',
    description: 'Get current weather for a location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City name',
        },
      },
      required: ['location'],
    },
    execute: getWeather,
    schema: weatherSchema,
  },
  {
    name: 'list_files',
    description: 'List files in a directory',
    parameters: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: 'Directory path (defaults to current directory)',
        },
      },
    },
    execute: listFiles,
    schema: listFilesSchema,
  },
];

/**
 * Execute a tool by name
 */
export async function executeTool(name: string, args: any) {
  const tool = tools.find((t) => t.name === name);
  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }

  try {
    // Validate args with Zod
    const validatedArgs = tool.schema.parse(args);
    return await tool.execute(validatedArgs);
  } catch (error) {
    return { error: (error as Error).message };
  }
}
