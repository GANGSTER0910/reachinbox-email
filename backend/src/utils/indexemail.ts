import { esClient } from '../services/elasticsearch';
import { category } from '../agent/categorizedai';
import { sendemailnotification, sendWebhookSiteNotification } from '../slack_webhook/webhook';
import { EmailData } from '../slack_webhook/webhook';

function cleanEmailContent(content: string): string {
  let cleanContent = content;
  
  // Remove MIME boundaries and headers
  cleanContent = cleanContent
    .replace(/--[a-zA-Z0-9]+/g, '') // Remove MIME boundaries
    .replace(/Content-Type:[^\\n]*/gi, '') // Remove Content-Type headers
    .replace(/Content-Transfer-Encoding:[^\\n]*/gi, '') // Remove encoding headers
    .replace(/MIME-Version:[^\\n]*/gi, '') // Remove MIME version
    .replace(/boundary=[^\\n]*/gi, '') // Remove boundary parameters
    .replace(/charset=[^\\n]*/gi, '') // Remove charset parameters
    .replace(/--[a-zA-Z0-9]+--/g, '') // Remove closing boundaries
    .replace(/cbhdhbha/g, '') // Remove specific artifacts
    .replace(/Content-Type: text\/html; charset="UTF-8"/gi, '') // Remove HTML content type
    .replace(/Content-Type: text\/plain; charset="UTF-8"/gi, '') // Remove plain text content type
    .replace(/<div[^>]*>/gi, '') // Remove div tags
    .replace(/<\/div>/gi, '') // Remove closing div tags
    .replace(/<br\s*\/?>/gi, '\n') // Replace br tags with newlines
    .replace(/<p[^>]*>/gi, '') // Remove p tags
    .replace(/<\/p>/gi, '\n') // Replace closing p tags with newlines
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove all remaining HTML tags
    .replace(/&nbsp;/g, ' ') // Replace HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');

  // Remove email headers if they're still present
  cleanContent = cleanContent
    .replace(/From:.*?\n/gi, '')
    .replace(/To:.*?\n/gi, '')
    .replace(/Subject:.*?\n/gi, '')
    .replace(/Date:.*?\n/gi, '')
    .replace(/Reply-To:.*?\n/gi, '')
    .replace(/Message-ID:.*?\n/gi, '')
    .replace(/X-Mailer:.*?\n/gi, '')
    .replace(/MIME-Version:.*?\n/gi, '')
    .replace(/Content-Type:.*?\n/gi, '')
    .replace(/Content-Transfer-Encoding:.*?\n/gi, '');

  // Remove multiple consecutive newlines and clean up whitespace
  cleanContent = cleanContent
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple newlines with double newlines
    .replace(/^\s+|\s+$/gm, '') // Trim whitespace from each line
    .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with double newlines
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Filter out meaningless content
  const lines = cleanContent.split('\n');
  const meaningfulLines = lines.filter(line => {
    const trimmedLine = line.trim();
    return trimmedLine.length > 0 && 
           !trimmedLine.match(/^[A-Z\s]+$/) && // Skip all caps lines
           !trimmedLine.match(/^[a-z0-9]{8,}$/) && // Skip random strings
           !trimmedLine.includes('Content-Type') &&
           !trimmedLine.includes('MIME-Version') &&
           !trimmedLine.includes('boundary=') &&
           !trimmedLine.includes('charset=') &&
           !trimmedLine.match(/^--[a-zA-Z0-9]+$/) && // Skip boundary lines
           !trimmedLine.match(/^[a-z]{8,}$/); // Skip random lowercase strings
  });

  return meaningfulLines.join('\n').trim();
}

export async function indexEmail(email: any) {
  let emailCategory: string = 'Uncategorized'; 
  
  try {
    console.log(`🔄 Starting to index email: "${email.subject}"`);
    
    // Use the already cleaned text from IMAP service
    const cleanText = email.text || '';
    
    // Categorize the email content
    const categoryResult = await category(cleanText);
    if (categoryResult) {
      emailCategory = categoryResult;
    }
    
    const emailelasticsearch: EmailData = {
      subject: email.subject,
      from: email.from,
      to: email.to,
      text: cleanText, // Use the already cleaned text
      html: email.html,
      folder: email.folder,
      accountId: email.account,
      date: email.date || new Date(),
      messageId: email.messageId,
      category: emailCategory as EmailData['category'], 
      bodyPreview: cleanText ? cleanText.substring(0, 500) : undefined,
    };
    
    console.log(`📊 Email data prepared for indexing:`, {
      subject: emailelasticsearch.subject,
      from: emailelasticsearch.from,
      category: emailelasticsearch.category,
      textLength: emailelasticsearch.text?.length || 0
    });
    
    // Index to Elasticsearch
    const result = await esClient.index({
      index: 'emails',
      document: emailelasticsearch,
    });
    
    console.log(`✅ Email indexed successfully! ID: ${result._id}, Subject: "${email.subject}"`);
    console.log(`📋 Email categorized as: '${emailCategory}'`);
    
    // Send notifications for Interested emails
    if (emailCategory === 'Interested') {
      console.log(`🎯 Email "${email.subject}" categorized as 'Interested'. Triggering notifications...`);
      
      // Send Slack notification
      await sendemailnotification(emailelasticsearch);
      
      // Send webhook.site notification for external automation
      await sendWebhookSiteNotification(emailelasticsearch);
    }

  } catch (error) {
    console.error(`❌ Error indexing email "${email.subject}":`, error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
  }
}
