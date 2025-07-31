# Email Processing Backend

This backend service processes emails in real-time, categorizes them using AI, and sends notifications for "Interested" emails.

## Features

- **Real-time email processing** via IMAP with IDLE mode
- **Multiple IMAP accounts** support (minimum 2 accounts)
- **AI-powered email categorization** using Groq
- **Slack notifications** for "Interested" emails
- **Webhook.site integration** for external automation
- **Elasticsearch indexing** with search capabilities
- **Advanced search and filtering** by folder, account, category, etc.

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Email Configuration (Primary Account)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Email Configuration (Secondary Account - Optional)
EMAIL_USER_2=your-second-email@gmail.com
EMAIL_PASS_2=your-second-app-password

# Slack Webhook Configuration
WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Webhook.site Configuration (for external automation)
WEBHOOK_SITE_URL=https://webhook.site/your-unique-webhook-url

# AI Configuration
GROQ_API_KEY=your-groq-api-key

# Elasticsearch Configuration (if using)
ELASTICSEARCH_URL=http://localhost:9200

# Server Configuration
PORT=5000
```

## Setup Instructions

### 1. Multiple Gmail Accounts Setup
1. Enable 2-factor authentication on both Gmail accounts
2. Generate app passwords for both accounts
3. Add both account credentials to your `.env` file

### 2. Slack Webhook Setup
1. Go to [Slack API](https://api.slack.com/apps)
2. Create a new app or use existing one
3. Go to "Incoming Webhooks" and create a new webhook
4. Copy the webhook URL and add it to `WEBHOOK_URL` in your `.env` file

### 3. Webhook.site Setup
1. Go to [webhook.site](https://webhook.site)
2. Copy your unique webhook URL
3. Add it to `WEBHOOK_SITE_URL` in your `.env` file

### 4. Groq API Key
1. Sign up at [Groq](https://console.groq.com/)
2. Generate an API key
3. Add it to `GROQ_API_KEY` in your `.env` file

### 5. Elasticsearch Setup
1. Start Elasticsearch using Docker:
```bash
docker-compose up -d
```

## Installation

```bash
npm install
npm run dev
```

## API Endpoints

### 1. Search Emails
```
GET /search?query=test&folder=INBOX&accountId=user@gmail.com&category=Interested&page=1&limit=20
```

**Query Parameters:**
- `query` - Text search in subject, body, from, to
- `folder` - Filter by email folder
- `accountId` - Filter by email account
- `category` - Filter by email category
- `from` - Filter by sender
- `to` - Filter by recipient
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)

### 2. Email Statistics
```
GET /stats
```

Returns:
- Total email count
- Category distribution
- Folder distribution
- Account distribution

### 3. Test Notifications
```
POST /test-notifications
```

Tests both Slack and webhook.site integrations.

### 4. Categorize Email
```
POST /category
Body: { "emailContent": "email text here" }
```

## How It Works

1. **Email Processing**: The service connects to multiple Gmail accounts via IMAP and monitors for new emails in real-time
2. **AI Categorization**: Each email is analyzed by Groq AI to determine if it's "Interested", "Not Interested", "Meeting Booked", "Spam", or "Out of Office"
3. **Notifications**: When an email is categorized as "Interested":
   - A Slack notification is sent with email details
   - A webhook is triggered to webhook.site for external automation
4. **Storage & Search**: All emails are indexed in Elasticsearch for advanced search and filtering

## Postman Testing

### Test Search API
```
GET http://localhost:5000/search?query=meeting&category=Interested
```

### Test Statistics
```
GET http://localhost:5000/stats
```

### Test Notifications
```
POST http://localhost:5000/test-notifications
```

### Test Categorization
```
POST http://localhost:5000/category
Content-Type: application/json

{
  "emailContent": "Hi, I'm interested in your product. Can we schedule a meeting?"
}
```

## Troubleshooting

### Slack Notifications Not Working
- Check that `WEBHOOK_URL` is correctly set in your `.env` file
- Verify the webhook URL is valid and active
- Check console logs for error messages

### Webhook.site Not Working
- Ensure `WEBHOOK_SITE_URL` is set correctly
- Verify the webhook URL is active and accessible
- Check network connectivity

### Email Connection Issues
- Verify `EMAIL_USER` and `EMAIL_PASS` are correct for both accounts
- Ensure you're using app passwords, not regular passwords
- Check that IMAP is enabled in your Gmail settings

### Search Not Working
- Ensure Elasticsearch is running: `docker-compose ps`
- Check that emails are being indexed (check console logs)
- Verify the search query parameters are correct 