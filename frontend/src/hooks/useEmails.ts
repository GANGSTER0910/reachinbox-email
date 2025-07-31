// // import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// // import { emailApi, Email, SearchResponse, StatsResponse } from '@/lib/api';
// // import { useToast } from '@/hooks/use-toast';
// // import { cleanEmailContent } from '@/lib/utils';

// // // Query keys for React Query
// // export const emailKeys = {
// //   all: ['emails'] as const,
// //   lists: () => [...emailKeys.all, 'list'] as const,
// //   list: (filters: any) => [...emailKeys.lists(), filters] as const,
// //   details: () => [...emailKeys.all, 'detail'] as const,
// //   detail: (id: string) => [...emailKeys.details(), id] as const,
// //   stats: () => [...emailKeys.all, 'stats'] as const,
// // };

// // // Hook for searching emails
// // export const useEmails = (params: {
// //   query?: string;
// //   folder?: string;
// //   accountId?: string;
// //   category?: string;
// //   from?: string;
// //   to?: string;
// //   page?: number;
// //   limit?: number;
// // }) => {
// //   return useQuery({
// //     queryKey: emailKeys.list(params),
// //     queryFn: () => emailApi.search(params),
// //     staleTime: 30000, // 30 seconds
// //     gcTime: 5 * 60 * 1000, // 5 minutes
// //   });
// // };

// // // Hook for getting email statistics
// // export const useEmailStats = () => {
// //   return useQuery({
// //     queryKey: emailKeys.stats(),
// //     queryFn: () => emailApi.getStats(),
// //     staleTime: 60000, // 1 minute
// //     gcTime: 10 * 60 * 1000, // 10 minutes
// //   });
// // };

// // // Hook for categorizing email content
// // export const useCategorizeEmail = () => {
// //   const queryClient = useQueryClient();
// //   const { toast } = useToast();
  
// //   return useMutation({
// //     mutationFn: (emailContent: string) => emailApi.categorizeEmail(emailContent),
// //     onSuccess: () => {
// //       // Invalidate and refetch email lists when categorization changes
// //       queryClient.invalidateQueries({ queryKey: emailKeys.lists() });
// //       toast({
// //         title: "Email categorized",
// //         description: "The email has been successfully categorized.",
// //       });
// //     },
// //     onError: (error) => {
// //       toast({
// //         title: "Categorization failed",
// //         description: "Failed to categorize the email. Please try again.",
// //         variant: "destructive",
// //       });
// //     },
// //   });
// // };

// // // Hook for testing notifications
// // export const useTestNotifications = () => {
// //   const { toast } = useToast();
  
// //   return useMutation({
// //     mutationFn: () => emailApi.testNotifications(),
// //     onSuccess: (data) => {
// //       toast({
// //         title: "Test notifications sent",
// //         description: data.message,
// //       });
// //     },
// //     onError: (error) => {
// //       toast({
// //         title: "Test failed",
// //         description: "Failed to send test notifications. Please try again.",
// //         variant: "destructive",
// //       });
// //     },
// //   });
// // };

// // // Utility function to transform email data for UI
// // export const transformEmailForUI = (email: Email) => {
// //   // Extract sender information more robustly
// //   let fromText = email.from || '';
// //   let subjectText = email.subject || '';
  
// //   // If from is empty, try to extract from email content
// //   if (!fromText && email.text) {
// //     // Look for common email patterns in the text
// //     const fromMatch = email.text.match(/From:\s*([^\n\r]+)/i);
// //     if (fromMatch) {
// //       fromText = fromMatch[1].trim();
// //     }
// //   }
  
// //   // If subject is empty, try to extract from email content
// //   if (!subjectText && email.text) {
// //     // Look for subject in the text
// //     const subjectMatch = email.text.match(/Subject:\s*([^\n\r]+)/i);
// //     if (subjectMatch) {
// //       subjectText = subjectMatch[1].trim();
// //     } else {
// //       // Try to extract from first meaningful line
// //       const lines = email.text.split('\n').filter(line => line.trim().length > 0);
// //       const firstLine = lines[0];
// //       if (firstLine && firstLine.length < 100 && !firstLine.includes('@') && !firstLine.includes('http')) {
// //         subjectText = firstLine.trim();
// //       }
// //     }
// //   }
  
// //   // Generate preview text
// //   let preview = email.bodyPreview || '';
// //   if (!preview && email.text) {
// //     // Use the utility function to clean the text
// //     const cleanText = cleanEmailContent(email.text);
// //     preview = cleanText.substring(0, 100);
// //   }
  
// //   // Debug logging to see what data we're getting
// //   console.log('Email data received:', {
// //     id: email.id,
// //     from: email.from,
// //     subject: email.subject,
// //     textLength: email.text?.length || 0,
// //     extractedFrom: fromText,
// //     extractedSubject: subjectText
// //   });
  
// //   return {
// //     id: email.id,
// //     from: fromText || 'Unknown Sender',
// //     subject: subjectText || 'No Subject',
// //     preview: preview || 'No preview available',
// //     timestamp: new Date(email.date).toLocaleString(),
// //     isRead: true,
// //     isStarred: false,
// //     hasAttachment: false,
// //     category: email.category?.toLowerCase().replace(/ /g, '-') || 'uncategorized' as any,
// //     account: email.accountId,
// //     content: email.text || '',
// //     to: email.to || 'Unknown',
// //     date: email.date,
// //   };
// // };

// // // Hook for getting a specific email by ID
// // export const useEmailById = (emailId: string | null) => {
// //   return useQuery({
// //     queryKey: emailKeys.detail(emailId || ''),
// //     queryFn: async () => {
// //       if (!emailId) return null;
      
// //       // Get the specific email by ID using the new endpoint
// //       const email = await emailApi.getEmailById(emailId);
// //       return transformEmailForUI(email);
// //     },
// //     enabled: !!emailId,
// //     staleTime: 30000, // 30 seconds
// //     gcTime: 5 * 60 * 1000, // 5 minutes
// //   });
// // };

// // // Hook for getting emails with UI transformation
// // export const useEmailsForUI = (params: {
// //   query?: string;
// //   folder?: string;
// //   accountId?: string;
// //   category?: string;
// //   from?: string;
// //   to?: string;
// //   page?: number;
// //   limit?: number;
// // }) => {
// //   const { data, isLoading, error, refetch } = useEmails(params);
  
// //   const transformedEmails = data?.hits.map(transformEmailForUI) || [];
  
// //   // Debug logging
// //   console.log('useEmailsForUI - Params:', params);
// //   console.log('useEmailsForUI - Raw data:', data);
// //   console.log('useEmailsForUI - Transformed emails:', transformedEmails);
  
// //   return {
// //     emails: transformedEmails,
// //     total: data?.total || 0,
// //     page: data?.page || 1,
// //     limit: data?.limit || 20,
// //     isLoading,
// //     error,
// //     refetch,
// //   };
// // }; 

// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { emailApi, Email } from '@/lib/api';
// import { useToast } from '@/hooks/use-toast';

// export const emailKeys = {
//   all: ['emails'] as const,
//   lists: () => [...emailKeys.all, 'list'] as const,
//   list: (filters: any) => [...emailKeys.lists(), filters] as const,
//   details: () => [...emailKeys.all, 'detail'] as const,
//   detail: (id: string) => [...emailKeys.details(), id] as const,
//   stats: () => [...emailKeys.all, 'stats'] as const,
// };

// export const useEmails = (params: {
//   query?: string;
//   folder?: string;
//   accountId?: string;
//   category?: string;
//   from?: string;
//   to?: string;
//   page?: number;
//   limit?: number;
// }) => {
//   return useQuery({
//     queryKey: emailKeys.list(params),
//     queryFn: () => emailApi.search(params),
//     staleTime: 30000,
//   });
// };

// export const useEmailStats = () => {
//   return useQuery({
//     queryKey: emailKeys.stats(),
//     queryFn: () => emailApi.getStats(),
//     staleTime: 60000,
//   });
// };

// export const useCategorizeEmail = () => {
//   const queryClient = useQueryClient();
//   const { toast } = useToast();
  
//   return useMutation({
//     mutationFn: (emailContent: string) => emailApi.categorizeEmail(emailContent),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: emailKeys.lists() });
//       toast({ title: "Email categorized" });
//     },
//     onError: () => {
//       toast({
//         title: "Categorization failed",
//         variant: "destructive",
//       });
//     },
//   });
// };

// const transformEmailForUI = (email: Email) => {
//   return {
//     id: email.id,
//     from: email.from || 'Unknown Sender',
//     to: email.to || 'Unknown',
//     subject: email.subject || 'No Subject',
//     preview: (email.bodyPreview || email.text || '').substring(0, 100),
//     timestamp: new Date(email.date).toLocaleString(),
//     isRead: true, // Assuming all fetched emails are read for now
//     isStarred: false,
//     hasAttachment: false,
//     category: email.category?.toLowerCase().replace(/ /g, '-') || 'uncategorized' as any,
//     account: email.accountId,
//     // **THIS IS THE FIX**: Pass both text and html content
//     content: email.text || '',
//     html: email.html || email.text || '', // Fallback to text if html is missing
//     date: email.date,
//   };
// };

// export const useEmailById = (emailId: string | null) => {
//   return useQuery({
//     queryKey: emailKeys.detail(emailId || ''),
//     queryFn: async () => {
//       if (!emailId) return null;
//       const email = await emailApi.getEmailById(emailId);
//       return transformEmailForUI(email);
//     },
//     enabled: !!emailId,
//   });
// };

// export const useEmailsForUI = (params: {
//   query?: string;
//   folder?: string;
//   accountId?: string;
//   category?: string;
//   from?: string;
//   to?: string;
//   page?: number;
//   limit?: number;
// }) => {
//   const { data, isLoading, error, refetch } = useEmails(params);
//   return {
//     emails: data?.hits.map(transformEmailForUI) || [],
//     total: data?.total || 0,
//     page: data?.page || 1,
//     limit: data?.limit || 20,
//     isLoading,
//     error,
//     refetch,
//   };
// };

import { useQuery } from '@tanstack/react-query';
import { emailApi, Email } from '@/lib/api';

export const emailKeys = {
  all: ['emails'],
  lists: () => [...emailKeys.all, 'list'],
  list: (filters: any) => [...emailKeys.lists(), filters],
  details: () => [...emailKeys.all, 'detail'],
  detail: (id: string) => [...emailKeys.details(), id],
  stats: (filters: any) => [...emailKeys.all, 'stats', filters],
};

export const useEmails = (params: {
  query?: string;
  folder?: string;
  accountId?: string;
  category?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: emailKeys.list(params),
    queryFn: () => emailApi.search(params),
    staleTime: 30000,
  });
};

// **FIXED STATS HOOK**
export const useEmailStats = (params: {
  folder?: string;
  accountId?: string;
  category?: string;
}) => {
  return useQuery({
    queryKey: emailKeys.stats(params),
    queryFn: () => emailApi.getStats(params),
    staleTime: 60000,
  });
};

const transformEmailForUI = (email: Email) => ({
  id: email.id,
  from: email.from || 'Unknown Sender',
  to: email.to || 'Unknown',
  subject: email.subject || 'No Subject',
  preview: (email.bodyPreview || email.text || '').substring(0, 100),
  timestamp: new Date(email.date).toLocaleString(),
  isRead: true,
  isStarred: false,
  hasAttachment: false,
  category: email.category?.toLowerCase().replace(/ /g, '-') || 'uncategorized' as any,
  account: email.accountId,
  content: email.text || '',
  html: email.html || email.text || '',
  date: email.date,
});

export const useEmailById = (emailId: string | null) => {
  return useQuery({
    queryKey: emailKeys.detail(emailId || ''),
    queryFn: async () => {
      if (!emailId) return null;
      const email = await emailApi.getEmailById(emailId);
      return transformEmailForUI(email);
    },
    enabled: !!emailId,
  });
};

export const useEmailsForUI = (params: {
  query?: string;
  folder?: string;
  accountId?: string;
  category?: string;
  page?: number;
  limit?: number;
}) => {
  const { data, ...rest } = useEmails(params);
  return {
    emails: data?.hits.map(transformEmailForUI) || [],
    total: data?.total || 0,
    ...rest,
  };
};