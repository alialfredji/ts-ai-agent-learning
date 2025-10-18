# Sample Documentation

This is a sample document for the RAG system to index.

## What is RAG?

Retrieval-Augmented Generation (RAG) is a technique that enhances large language models by providing them with relevant context from external knowledge sources. Instead of relying solely on the model's training data, RAG systems:

1. **Retrieve** relevant documents from a knowledge base
2. **Augment** the prompt with this context
3. **Generate** responses based on the retrieved information

## Benefits of RAG

- **Up-to-date information**: Access current data not in the model's training set
- **Reduced hallucinations**: Ground responses in factual documents
- **Domain-specific knowledge**: Provide specialized information
- **Cost-effective**: No need to fine-tune large models
- **Transparent**: Can cite sources for answers

## Building a RAG System

The key components are:

1. **Document Ingestion**: Load and chunk documents
2. **Embedding Generation**: Convert text to vectors
3. **Vector Storage**: Store embeddings in a database (e.g., pgvector)
4. **Retrieval**: Find similar documents using vector search
5. **Generation**: Use LLM with retrieved context

## Best Practices

- Experiment with chunk sizes (500-1500 tokens typically)
- Use overlap between chunks to maintain context
- Implement hybrid search (vector + keyword)
- Add metadata filtering for better results
- Consider re-ranking retrieved documents
