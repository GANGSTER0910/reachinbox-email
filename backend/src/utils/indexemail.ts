import { esClient } from '../services/elasticsearch';
import { category } from '../agent/categorizedai';
import { sendemailnotification, sendWebhookSiteNotification } from '../slack_webhook/webhook';
import { EmailData } from '../slack_webhook/webhook';

export async function indexEmail(email: any) {
  let emailCategory: string = 'Uncategorized'; 
  
  try {
    // Categorize the email content
    const categoryResult = await category(email.text || email.html || '');
    if (categoryResult) {
      emailCategory = categoryResult;
    }
    
    const emailelasticsearch: EmailData = {
      subject: email.subject,
      from: email.from,
      to: email.to,
      text: email.text,
      html: email.html,
      folder: email.folder,
      accountId: email.account,
      date: email.date || new Date(),
      messageId: email.messageId,
      category: emailCategory as EmailData['category'], 
      bodyPreview: email.text ? email.text.substring(0, 500) : undefined,
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
