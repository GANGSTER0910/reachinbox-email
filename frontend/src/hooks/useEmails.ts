import { useQuery } from '@tanstack/react-query';
import { emailApi, Email } from '@/lib/api';

export const emailKeys = {
  all: ['emails'],
  lists: () => [...emailKeys.all, 'list'],
  list: (filters: any) => [...emailKeys.lists(), filters],
  details: () => [...emailKeys.all, 'detail'],
  detail: (id: string) => [...emailKeys.details(), id],
  stats: (filters: any) => [...emailKeys.all, 'stats', filters],
  accounts: () => [...emailKeys.all, 'accounts'],
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

export const useEmailAccounts = () => {
  return useQuery({
    queryKey: emailKeys.accounts(),
    queryFn: () => emailApi.getAccounts(),
    staleTime: Infinity, // Accounts rarely change, so cache indefinitely
  });};