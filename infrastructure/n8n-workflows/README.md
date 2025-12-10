# n8n Workflows

## Importing Workflows

1. Start n8n: `docker-compose up n8n`
2. Open http://localhost:5678
3. Go to Workflows > Import from File
4. Import each JSON file

## Available Workflows

### Chat Webhook
- **Trigger**: POST /webhook/chat
- **Body**: `{ "message": "your question", "agent_id": "doc" }`
- **Response**: Agent response with conversation ID

### Incident Handler
- **Trigger**: POST /webhook/incident
- **Body**: `{ "log_snippet": "ERROR: Connection refused..." }`
- **Response**: Incident analysis with severity and actions

## Testing

```bash
# Test chat webhook
curl -X POST http://localhost:5678/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is this project about?", "agent_id": "doc"}'

# Test incident handler
curl -X POST http://localhost:5678/webhook/incident \
  -H "Content-Type: application/json" \
  -d '{"log_snippet": "ERROR: Database connection failed after 3 retries"}'
```

