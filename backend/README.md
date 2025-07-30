# Email Processing Backend

This backend service processes emails in real-time, categorizes them using AI, and sends notifications for "Interested" emails.

## Features

- Real-time email processing via IMAP
- AI-powered email categorization
- Slack notifications for "Interested" emails
- Webhook.site integration for external automation
- Elasticsearch indexing

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

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

### 1. Slack Webhook Setup
1. Go to [Slack API](https://api.slack.com/apps)
2. Create a new app or use existing one
3. Go to "Incoming Webhooks" and create a new webhook
4. Copy the webhook URL and add it to `WEBHOOK_URL` in your `.env` file

### 2. Webhook.site Setup
1. Go to [webhook.site](https://webhook.site)
2. Copy your unique webhook URL
3. Add it to `WEBHOOK_SITE_URL` in your `.env` file

### 3. Gmail App Password
1. Enable 2-factor authentication on your Gmail account
2. Generate an app password for this application
3. Use the app password in `EMAIL_PASS`

### 4. Groq API Key
1. Sign up at [Groq](https://console.groq.com/)
2. Generate an API key
3. Add it to `GROQ_API_KEY` in your `.env` file

## Installation

```bash
npm install
npm run dev
```

## How It Works

1. **Email Processing**: The service connects to Gmail via IMAP and monitors for new emails
2. **AI Categorization**: Each email is analyzed by Groq AI to determine if it's "Interested", "Not Interested", "Meeting Booked", "Spam", or "Out of Office"
3. **Notifications**: When an email is categorized as "Interested":
   - A Slack notification is sent with email details
   - A webhook is triggered to webhook.site for external automation
4. **Storage**: All emails are indexed in Elasticsearch for search and analytics

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
- Verify `EMAIL_USER` and `EMAIL_PASS` are correct
- Ensure you're using an app password, not your regular password
- Check that IMAP is enabled in your Gmail settings 