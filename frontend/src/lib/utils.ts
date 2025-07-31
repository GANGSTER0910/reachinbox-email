import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to clean email content
export const cleanEmailContent = (content: string): string => {
  if (!content) return '';
  
  let cleanContent = content;

  // Remove HTML tags but preserve links
  cleanContent = cleanContent.replace(/<(?!a\s|a>|img\s|img>)[^>]*>/g, '');
  
  // Decode HTML entities
  cleanContent = cleanContent
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&zwnj;/g, '')
    .replace(/&zwj;/g, '');

  // Clean up URLs but keep them readable
  cleanContent = cleanContent.replace(/https?:\/\/[^\s]+/g, (url) => {
    try {
      // Decode URL parameters
      const decodedUrl = decodeURIComponent(url);
      // Remove excessive tracking parameters but keep the main URL
      const urlParts = decodedUrl.split('?');
      const baseUrl = urlParts[0];
      const params = urlParts[1];
      
      if (params) {
        // Keep only essential parameters, remove tracking ones
        const essentialParams = params.split('&')
          .filter(param => !param.includes('tracking') && !param.includes('trk') && !param.includes('refId'))
          .slice(0, 3); // Keep only first 3 parameters
        
        if (essentialParams.length > 0) {
          return `${baseUrl}?${essentialParams.join('&')}`;
        }
      }
      
      return baseUrl;
    } catch {
      return url;
    }
  });

  // Remove MIME boundaries and headers
  cleanContent = cleanContent
    .replace(/--[a-zA-Z0-9_-]+/g, '')
    .replace(/Content-Type:[^\n]*/gi, '')
    .replace(/Content-Transfer-Encoding:[^\n]*/gi, '')
    .replace(/MIME-Version:[^\n]*/gi, '')
    .replace(/boundary=[^\n]*/gi, '')
    .replace(/charset=[^\n]*/gi, '');

  // Remove email headers
  cleanContent = cleanContent
    .replace(/From:[^\n]*/gi, '')
    .replace(/To:[^\n]*/gi, '')
    .replace(/Subject:[^\n]*/gi, '')
    .replace(/Date:[^\n]*/gi, '')
    .replace(/Reply-To:[^\n]*/gi, '')
    .replace(/Message-ID:[^\n]*/gi, '')
    .replace(/X-Mailer:[^\n]*/gi, '');

  // Remove encoded words (like =?UTF-8?Q?...?=)
  cleanContent = cleanContent.replace(/=\?[^?]+\?[BQ]\?[^?]*\?=/g, '');

  // Remove base64 encoded content
  cleanContent = cleanContent.replace(/[A-Za-z0-9+/]{50,}={0,2}/g, '');

  // Clean up whitespace
  cleanContent = cleanContent
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/^\s+|\s+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim();

  // Filter out meaningless lines
  const lines = cleanContent.split('\n');
  const meaningfulLines = lines.filter(line => {
    const trimmedLine = line.trim();
    return trimmedLine.length > 0 && 
           trimmedLine.length < 500 && // Allow longer lines for URLs
           !trimmedLine.match(/^[A-Z\s]+$/) && // Skip all caps lines
           !trimmedLine.match(/^[a-z0-9]{8,}$/) && // Skip random strings
           !trimmedLine.includes('Content-Type') &&
           !trimmedLine.includes('MIME-Version') &&
           !trimmedLine.includes('boundary=') &&
           !trimmedLine.includes('charset=') &&
           !trimmedLine.match(/^--[a-zA-Z0-9]+$/) && // Skip boundary lines
           !trimmedLine.match(/^[a-z]{8,}$/) && // Skip random lowercase strings
           !trimmedLine.startsWith('_DEFAULT_EMAIL_CONTENT_DELIMITER_'); // Skip internal delimiters
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
