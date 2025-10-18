/**
 * Document indexing script
 *
 * Indexes local Markdown files into the vector database.
 */

import fs from 'fs/promises';
import path from 'path';
import { VectorStore } from '../lib/vector-store.js';
import { EmbeddingGenerator, chunkText } from '../lib/embeddings.js';

async function indexDocuments() {
  console.log('🚀 Starting document indexing...\n');

  // Validate DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL environment variable is required. ' +
        'Please set it in your .env file or environment. ' +
        'Example: DATABASE_URL=postgresql://user:password@localhost:5432/agents_db'
    );
  }

  const vectorStore = new VectorStore(process.env.DATABASE_URL);
  await vectorStore.initialize();

  const embedder = new EmbeddingGenerator();

  // Read markdown files from docs directory
  const docsDir = path.join(process.cwd(), 'beginner/02-local-rag/docs');
  const files = await fs.readdir(docsDir);
  const markdownFiles = files.filter((f) => f.endsWith('.md'));

  console.log(`Found ${markdownFiles.length} Markdown files\n`);

  for (const file of markdownFiles) {
    const filePath = path.join(docsDir, file);
    const content = await fs.readFile(filePath, 'utf-8');

    // Chunk the document
    const chunks = chunkText(content, { chunkSize: 800, overlap: 100 });

    console.log(`📄 ${file}: ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await embedder.generateEmbedding(chunk);

      await vectorStore.addDocument({
        id: `${file}-chunk-${i}`,
        content: chunk,
        embedding,
        metadata: {
          source: file,
          chunkIndex: i,
          totalChunks: chunks.length,
        },
      });

      process.stdout.write('.');
    }

    console.log(' ✓\n');
  }

  await vectorStore.close();
  console.log('\n✅ Indexing complete!');
}

indexDocuments().catch(console.error);
