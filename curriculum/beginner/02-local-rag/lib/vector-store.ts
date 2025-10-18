/**
 * Vector store using pgvector
 */

import pg from 'pg';

const { Pool } = pg;

export interface Document {
  id: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

export class VectorStore {
  private pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
    });
  }

  async initialize() {
    const client = await this.pool.connect();
    try {
      // Create extension
      await client.query('CREATE EXTENSION IF NOT EXISTS vector');

      // Create table
      await client.query(`
        CREATE TABLE IF NOT EXISTS documents (
          id TEXT PRIMARY KEY,
          content TEXT NOT NULL,
          embedding vector(1536),
          metadata JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      // Create index for vector similarity search
      await client.query(`
        CREATE INDEX IF NOT EXISTS documents_embedding_idx 
        ON documents USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100)
      `);
    } finally {
      client.release();
    }
  }

  async addDocument(doc: Document) {
    const client = await this.pool.connect();
    try {
      await client.query(
        `INSERT INTO documents (id, content, embedding, metadata) 
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE 
         SET content = $2, embedding = $3, metadata = $4`,
        [doc.id, doc.content, JSON.stringify(doc.embedding), JSON.stringify(doc.metadata || {})]
      );
    } finally {
      client.release();
    }
  }

  async search(queryEmbedding: number[], limit: number = 5) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT id, content, metadata, 
                1 - (embedding <=> $1::vector) as similarity
         FROM documents
         ORDER BY embedding <=> $1::vector
         LIMIT $2`,
        [JSON.stringify(queryEmbedding), limit]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async close() {
    await this.pool.end();
  }
}
