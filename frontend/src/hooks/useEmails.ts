import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailApi, Email, SearchResponse, StatsResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cleanEmailContent } from '@/lib/utils';

// Query keys for React Query
export const emailKeys = {
  all: ['emails'] as const,
  lists: () => [...emailKeys.all, 'list'] as const,
  list: (filters: any) => [...emailKeys.lists(), filters] as const,
  details: () => [...emailKeys.all, 'detail'] as const,
  detail: (id: string) => [...emailKeys.details(), id] as const,
  stats: () => [...emailKeys.all, 'stats'] as const,
};

// Hook for searching emails
export const useEmails = (params: {
  query?: string;
  folder?: string;
  accountId?: string;
  category?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: emailKeys.list(params),
    queryFn: () => emailApi.search(params),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for getting email statistics
export const useEmailStats = () => {
  return useQuery({
    queryKey: emailKeys.stats(),
    queryFn: () => emailApi.getStats(),
    staleTime: 60000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for categorizing email content
export const useCategorizeEmail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (emailContent: string) => emailApi.categorizeEmail(emailContent),
    onSuccess: () => {
      // Invalidate and refetch email lists when categorization changes
      queryClient.invalidateQueries({ queryKey: emailKeys.lists() });
      toast({
        title: "Email categorized",
        description: "The email has been successfully categorized.",
      });
    },
    onError: (error) => {
      toast({
        title: "Categorization failed",
        description: "Failed to categorize the email. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Hook for testing notifications
export const useTestNotifications = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: () => emailApi.testNotifications(),
    onSuccess: (data) => {
      toast({
        title: "Test notifications sent",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        title: "Test failed",
        description: "Failed to send test notifications. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Utility function to transform email data for UI
export const transformEmailForUI = (email: Email) => {
  // Extract sender information more robustly
  let fromText = email.from || '';
  let subjectText = email.subject || '';
  
  // If from is empty, try to extract from email content
  if (!fromText && email.text) {
    // Look for common email patterns in the text
    const fromMatch = email.text.match(/From:\s*([^\n\r]+)/i);
    if (fromMatch) {
      fromText = fromMatch[1].trim();
    }
  }
  
  // If subject is empty, try to extract from email content
  if (!subjectText && email.text) {
    // Look for subject in the text
    const subjectMatch = email.text.match(/Subject:\s*([^\n\r]+)/i);
    if (subjectMatch) {
      subjectText = subjectMatch[1].trim();
    } else {
      // Try to extract from first meaningful line
      const lines = email.text.split('\n').filter(line => line.trim().length > 0);
      const firstLine = lines[0];
      if (firstLine && firstLine.length < 100 && !firstLine.includes('@') && !firstLine.includes('http')) {
        subjectText = firstLine.trim();
      }
    }
  }
  
  // Generate preview text
  let preview = email.bodyPreview || '';
  if (!preview && email.text) {
    // Use the utility function to clean the text
    const cleanText = cleanEmailContent(email.text);
    preview = cleanText.substring(0, 100);
  }
  
  // Debug logging to see what data we're getting
  console.log('Email data received:', {
    id: email.id,
    from: email.from,
    subject: email.subject,
    textLength: email.text?.length || 0,
    extractedFrom: fromText,
    extractedSubject: subjectText
  });
  
  return {
    id: email.id,
    from: fromText || 'Unknown Sender',
    subject: subjectText || 'No Subject',
    preview: preview || 'No preview available',
    timestamp: new Date(email.date).toLocaleString(),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    category: email.category?.toLowerCase().replace(/ /g, '-') || 'uncategorized' as any,
    account: email.accountId,
    content: email.text || '',
    to: email.to || 'Unknown',
    date: email.date,
  };
};

// Hook for getting emails with UI transformation
export const useEmailsForUI = (params: {
  query?: string;
  folder?: string;
  accountId?: string;
  category?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) => {
  const { data, isLoading, error, refetch } = useEmails(params);
  
  return {
    emails: data?.hits.map(transformEmailForUI) || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 20,
    isLoading,
    error,
    refetch,
  };
}; 