import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {ImapService} from './services/imapservice';
import {category} from './agent/categorizedai';
import { sendemailnotification, sendWebhookSiteNotification } from './slack_webhook/webhook';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const emailUser = process.env.EMAIL_USER!;
const emailPass = process.env.EMAIL_PASS!;
app.use(cors());
app.use(express.json());
const imapService = new ImapService(emailUser, emailPass);
imapService.connectrealtime();
app.get('/', (_req, res) => {
  res.send('Email Backend Running');
});
app.post('/category', async (req, res) => {
  const { emailContent } = req.body;
  if (!emailContent) {
    return res.status(400).json({ error: 'Email content is required' });
  }
  try {
    const categoryResult = await category(emailContent);
    res.json({ category: categoryResult });
  } catch (error) {
    console.error('Error categorizing email:', error);
    res.status(500).json({ error: 'Failed to categorize email' });
  }
});

app.post('/test-notifications', async (req, res) => {
  try {
    const testEmail = {
      subject: 'Test Email - Interested',
      from: 'test@example.com',
      to: 'user@example.com',
      text: 'This is a test email to verify notifications are working.',
      folder: 'INBOX',
      accountId: 'test-account',
      date: new Date(),
      messageId: 'test-message-id',
      category: 'Interested' as const,
      bodyPreview: 'This is a test email to verify notifications are working.'
    };

    console.log('🧪 Testing notifications...');
    
    // Test Slack notification
    await sendemailnotification(testEmail);
    
    // Test webhook.site notification
    await sendWebhookSiteNotification(testEmail);
    
    res.json({ 
      success: true, 
      message: 'Test notifications sent successfully. Check your Slack and webhook.site for the test messages.' 
    });
  } catch (error) {
    console.error('Error testing notifications:', error);
    res.status(500).json({ error: 'Failed to send test notifications' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
