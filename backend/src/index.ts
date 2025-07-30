import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {ImapService} from './services/imapservice';
import {category} from './agent/categorizedai';
import { sendemailnotification, sendWebhookSiteNotification } from './slack_webhook/webhook';
import { esClient } from './services/elasticsearch';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const emailAccounts = [
  {
    user: process.env.EMAIL_USER!,
    password: process.env.EMAIL_PASS!,
    name: 'Primary Account'
  },
  {
    user: process.env.EMAIL_USER_2!,
    password: process.env.EMAIL_PASS_2!,
    name: 'Secondary Account'
  }
].filter(account => account.user && account.password); 

app.use(cors());
app.use(express.json());

const imapServices: ImapService[] = [];
emailAccounts.forEach((account, index) => {
  if (account.user && account.password) {
    const imapService = new ImapService(account.user, account.password);
    imapService.connectrealtime();
    imapServices.push(imapService);
    console.log(`✅ Connected to IMAP account ${index + 1}: ${account.name}`);
  }
});

app.get('/', (_req, res) => {
  res.send('Email Backend Running');
});

app.get('/search', async (req, res) => {
  try {
    const { 
      query = '', 
      folder = '', 
      accountId = '', 
      category = '',
      from = '',
      to = '',
      page = 1,
      limit = 20
    } = req.query;

    const must: any[] = [];
    
    if (query) {
      must.push({
        multi_match: {
          query: query as string,
          fields: ['subject^2', 'text', 'from', 'to'],
          fuzziness: 'AUTO'
        }
      });
    }

    if (folder) {
      must.push({ match: { folder: folder as string } });
    }

    if (accountId) {
      must.push({ match: { accountId: accountId as string } });
    }
    if (category) {
      must.push({ match: { category: category as string } });
    }
    if (from) {
      must.push({ match: { from: from as string } });
    }
    if (to) {
      must.push({ match: { to: to as string } });
    }

    const searchBody: any = {
      query: {
        bool: {
          must: must.length > 0 ? must : [{ match_all: {} }]
        }
      },
      sort: [
        { date: { order: 'desc' } }
      ],
      from: (Number(page) - 1) * Number(limit),
      size: Number(limit)
    };

    const result = await esClient.search({
      index: 'emails',
      body: searchBody
    });

    const total = typeof result.hits.total === 'object' 
      ? result.hits.total.value 
      : result.hits.total;

    res.json({
      hits: result.hits.hits.map((hit: any) => ({
        id: hit._id,
        ...hit._source
      })),
      total: total || 0,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

app.get('/stats', async (req, res) => {
  try {
    const result = await esClient.search({
      index: 'emails',
      body: {
        size: 0,
        aggs: {
          categories: {
            terms: { field: 'category.keyword' }
          },
          folders: {
            terms: { field: 'folder.keyword' }
          },
          accounts: {
            terms: { field: 'accountId.keyword' }
          },
          total_emails: {
            value_count: { field: '_id' }
          }
        }
      }
    } as any);

    const aggregations = result.aggregations as any;

    res.json({
      total: aggregations?.total_emails?.value || 0,
      categories: aggregations?.categories?.buckets || [],
      folders: aggregations?.folders?.buckets || [],
      accounts: aggregations?.accounts?.buckets || []
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

app.post('/category', async (req, res) => {
  const { emailContent } = req.body;
  if (!emailContent) {
    return res.status(400).json({ error: 'Email content is required' });
  }
  try {
    const categoryResult = await category(emailContent);
    res.json({ category: categoryResult });
  } catch (error) {
    console.error('Error categorizing email:', error);
    res.status(500).json({ error: 'Failed to categorize email' });
  }
});

app.post('/test-notifications', async (req, res) => {
  try {
    const testEmail = {
      subject: 'Test Email - Interested',
      from: 'test@example.com',
      to: 'user@example.com',
      text: 'This is a test email to verify notifications are working.',
      folder: 'INBOX',
      accountId: 'test-account',
      date: new Date(),
      messageId: 'test-message-id',
      category: 'Interested' as const,
      bodyPreview: 'This is a test email to verify notifications are working.'
    };

    console.log('🧪 Testing notifications...');
    
    await sendemailnotification(testEmail);
    await sendWebhookSiteNotification(testEmail);
    
    res.json({ 
      success: true, 
      message: 'Test notifications sent successfully. Check your Slack and webhook.site for the test messages.' 
    });
  } catch (error) {
    console.error('Error testing notifications:', error);
    res.status(500).json({ error: 'Failed to send test notifications' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`📧 Connected to ${imapServices.length} IMAP account(s)`);
});
