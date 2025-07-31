import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailApi, Email, SearchResponse, StatsResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

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
export const transformEmailForUI = (email: Email) => ({
  id: email.id,
  from: email.from,
  fromEmail: email.from, // You might want to extract email from the from field
  subject: email.subject,
  preview: email.bodyPreview || email.text?.substring(0, 100) || '',
  timestamp: new Date(email.date).toLocaleString(),
  isRead: true, // You might want to track read status separately
  isStarred: false, // You might want to track starred status separately
  hasAttachment: false, // You might want to detect attachments
  category: email.category?.toLowerCase().replace(/ /g, '-') || 'uncategorized' as any,
  account: email.accountId,
  content: email.text || '',
  to: email.to,
  date: email.date,
});

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