import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to clean email content
export const cleanEmailContent = (content: string): string => {
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
};

// Utility function to extract email sender and subject from content
export const extractEmailInfo = (email: any) => {
  let fromText = email.from || '';
  let subjectText = email.subject || '';
  
  // If from is empty, try to extract from email content
  if (!fromText && email.text) {
    // Look for various patterns in the email text
    const fromMatch = email.text.match(/From:\s*([^\n\r]+)/i);
    if (fromMatch) {
      fromText = fromMatch[1].trim();
    } else {
      // Look for email addresses in the text
      const emailMatch = email.text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        fromText = emailMatch[1];
      }
    }
  }
  
  // If subject is empty, try to extract from email content
  if (!subjectText && email.text) {
    const subjectMatch = email.text.match(/Subject:\s*([^\n\r]+)/i);
    if (subjectMatch) {
      subjectText = subjectMatch[1].trim();
    } else {
      // Try to extract from first meaningful line
      const lines = email.text.split('\n').filter(line => line.trim().length > 0);
      for (const line of lines) {
        const trimmedLine = line.trim();
        // Skip lines that look like email addresses, URLs, or are too long
        if (trimmedLine.length > 0 && 
            trimmedLine.length < 100 && 
            !trimmedLine.includes('@') && 
            !trimmedLine.includes('http') &&
            !trimmedLine.includes('://') &&
            !trimmedLine.match(/^\d+$/) && // Skip pure numbers
            !trimmedLine.match(/^[A-Z\s]+$/)) { // Skip all caps
          subjectText = trimmedLine;
          break;
        }
      }
    }
  }
  
  // For the specific email format you provided, try to extract sender from the content
  if (!fromText && email.text) {
    // Look for patterns like "This email was sent to" followed by an email
    const sentToMatch = email.text.match(/This email was sent to ([^\s]+@[^\s]+)/i);
    if (sentToMatch) {
      // Extract the sender from the context
      const lines = email.text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.includes('Regards,') || line.includes('Best regards,')) {
          // The sender is likely the next line
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1].trim();
            if (nextLine && !nextLine.includes('@') && nextLine.length < 50) {
              fromText = nextLine;
              break;
            }
          }
        }
      }
    }
  }
  
  return { 
    fromText: fromText || 'Unknown Sender', 
    subjectText: subjectText || 'No Subject' 
  };
};
