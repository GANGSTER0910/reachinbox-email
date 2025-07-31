import { esClient } from '../services/elasticsearch';
import { category } from '../agent/categorizedai';
import { sendemailnotification, sendWebhookSiteNotification } from '../slack_webhook/webhook';
import { EmailData } from '../slack_webhook/webhook';

export async function indexEmail(email: any) {
  if (!email.messageId) {
    console.warn(`Skipping email due to missing messageId: "${email.subject}"`);
    return;
  }

  try {
    const cleanText = email.text || '';
    const emailCategory = await category(cleanText);
    
    const emailelasticsearch: EmailData = {
      subject: email.subject,
      from: email.from,
      to: email.to,
      text: cleanText,
      html: email.html,
      folder: email.folder,
      accountId: email.account,
      date: email.date || new Date(),
      messageId: email.messageId,
      category: emailCategory as EmailData['category'], 
      bodyPreview: cleanText.substring(0, 250),
    };
    
    const result = await esClient.index({
      index: 'emails',
      id: email.messageId,
      document: emailelasticsearch,
    });
    
    console.log(`✅ Email indexed/updated! ID: ${result._id}, Subject: "${email.subject}", Category: "${emailCategory}"`);
    
    if (emailCategory === 'Interested') {
      await sendemailnotification(emailelasticsearch);
      await sendWebhookSiteNotification(emailelasticsearch);
    }

  } catch (error) {
    console.error(`❌ Error indexing email "${email.subject}":`, error);
  }
}