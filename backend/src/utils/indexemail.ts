import { esClient } from '../services/elasticsearch';
import { category } from '../agent/categorizedai';
import { sendemailnotification, sendWebhookSiteNotification } from '../slack_webhook/webhook';
import { EmailData } from '../slack_webhook/webhook';

function cleanEmailContent(content: string): string {
  return content
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ') // Replace HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

export async function indexEmail(email: any) {
  let emailCategory: string = 'Uncategorized'; 
  
  try {
    // Clean email content
    const cleanText = cleanEmailContent(email.text || email.html || '');
    
    // Categorize the email content
    const categoryResult = await category(cleanText);
    if (categoryResult) {
      emailCategory = categoryResult;
    }
    
    const emailelasticsearch: EmailData = {
      subject: email.subject,
      from: email.from,
      to: email.to,
      text: cleanText, // Use cleaned text
      html: email.html,
      folder: email.folder,
      accountId: email.account,
      date: email.date || new Date(),
      messageId: email.messageId,
      category: emailCategory as EmailData['category'], 
      bodyPreview: cleanText ? cleanText.substring(0, 500) : undefined,
    };
    
    // Index to Elasticsearch
    await esClient.index({
      index: 'emails',
      document: emailelasticsearch,
    });
    
    console.log(`Email "${email.subject}" categorized as '${emailCategory}'`);
    
    // Send notifications for Interested emails
    if (emailCategory === 'Interested') {
      console.log(`🎯 Email "${email.subject}" categorized as 'Interested'. Triggering notifications...`);
      
      // Send Slack notification
      await sendemailnotification(emailelasticsearch);
      
      // Send webhook.site notification for external automation
      await sendWebhookSiteNotification(emailelasticsearch);
    }

    console.log("Email object structure:", JSON.stringify(email, null, 2));
  } catch (error) {
    console.error('Error indexing email:', error);
  }
}
