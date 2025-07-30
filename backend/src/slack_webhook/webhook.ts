import { IncomingWebhook } from "@slack/webhook";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const slackWebhookUrl = process.env.WEBHOOK_URL;
const webhook = slackWebhookUrl ? new IncomingWebhook(slackWebhookUrl) : null;

const webhookSiteUrl = process.env.WEBHOOK_SITE_URL;

export interface EmailData {
  id?: string;
  accountId: string;
  folder: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: Date;
  text?: string; 
  html?: string; 
  bodyPreview?: string; 
  category?: 'Interested' | 'Meeting Booked' | 'Not Interested' | 'Spam' | 'Out of Office' | 'Uncategorized';
  messageId?: string;
}

export async function sendemailnotification(email: EmailData) {
    if (!webhook) {
        console.error('Slack webhook URL not configured. Please set WEBHOOK_URL environment variable.');
        return;
    }
    
    try {
        const subject = email.subject || 'No Subject';
        const from = email.from || 'Unknown Sender';
        const bodyPreview = email.bodyPreview || email.text?.substring(0, 250) || 'No preview available.';

        await webhook.send({
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `🎉 New *Interested* Email! 🎉`,
                    },
                },
                {
                    type: 'divider',
                },
                {
                    type: 'section',
                    fields: [
                        {
                            type: 'mrkdwn',
                            text: `*Subject:*\n${subject}`
                        },
                        {
                            type: 'mrkdwn',
                            text: `*From:*\n${from}`
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Account:*\n${email.accountId}`
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Folder:*\n${email.folder}`
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Date:*\n${email.date?.toLocaleString() || 'N/A'}`
                        }
                    ]
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Preview:*\n${bodyPreview.substring(0, 250)}...`
                    }
                },
            ]
        });
        console.log(`✅ Slack notification sent for email: ${subject}`);
    } catch (error) {
        console.error(`❌ Error sending Slack notification for email ${email.subject}:`, error);
    }
}

export async function sendWebhookSiteNotification(email: EmailData) {
    if (!webhookSiteUrl) {
        console.error('Webhook.site URL not configured. Please set WEBHOOK_SITE_URL environment variable.');
        return;
    }

    try {
        const payload = {
            event: 'email_interested',
            timestamp: new Date().toISOString(),
            email: {
                subject: email.subject,
                from: email.from,
                to: email.to,
                category: email.category,
                folder: email.folder,
                accountId: email.accountId,
                date: email.date,
                bodyPreview: email.bodyPreview || email.text?.substring(0, 500),
                messageId: email.messageId
            }
        };

        await axios.post(webhookSiteUrl, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`✅ Webhook.site notification sent for email: ${email.subject}`);
    } catch (error) {
        console.error(`❌ Error sending webhook.site notification for email ${email.subject}:`, error);
    }
}
