# 03: Inbox Triager

An intelligent email triaging agent that categorizes and prioritizes messages using rule-based planning and structured outputs.

## Learning Objectives

- Implement structured output generation
- Use rule-based planning for agent decisions
- Work with JSON schemas for reliable parsing
- Handle batch processing workflows
- Implement priority classification

## Features

- Email categorization (work, personal, spam, etc.)
- Priority assignment (high, medium, low)
- Action recommendations (reply, archive, flag, etc.)
- Structured JSON output
- Batch processing support

## Usage

```bash
# Run the triager on sample emails
pnpm tsx beginner/03-inbox-triager/index.ts

# Process from JSON file
pnpm tsx beginner/03-inbox-triager/index.ts --input emails.json

# With specific model provider
MODEL_PROVIDER=anthropic pnpm tsx beginner/03-inbox-triager/index.ts
```

## Project Structure

- `index.ts` - Main triaging logic
- `schemas.ts` - Zod schemas for structured output
- `rules.ts` - Rule-based triage logic
- `sample-emails.ts` - Sample email data
- `types.ts` - TypeScript types

## Example Output

```json
{
  "email_id": "123",
  "subject": "Urgent: Server down",
  "category": "work",
  "priority": "high",
  "suggested_actions": ["reply", "flag"],
  "reasoning": "Contains urgent keywords and is from engineering team",
  "tags": ["urgent", "technical", "incident"]
}
```

## Next Steps

- Connect to real email APIs (Gmail, Outlook)
- Add custom rule configuration
- Implement learning from user feedback
- Add sentiment analysis
- Create auto-response drafts for common queries
