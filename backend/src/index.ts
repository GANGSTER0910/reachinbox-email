import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {ImapService} from './services/imapservice';
import {category} from './agent/categorizedai';
import { esClient } from './services/elasticsearch';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const emailAccounts = [
  { user: process.env.EMAIL_USER!, password: process.env.EMAIL_PASS! },
  { user: process.env.EMAIL_USER_2!, password: process.env.EMAIL_PASS_2! }
].filter(account => account.user && account.password); 

app.use(cors());
app.use(express.json());

const imapServices: ImapService[] = [];
emailAccounts.forEach(account => {
  const imapService = new ImapService(account.user, account.password);
  imapService.connectrealtime();
  imapServices.push(imapService);
});

app.get('/search', async (req, res) => {
  try {
    const { 
      query = '', 
      folder = '', 
      accountId = '', 
      category = '',
      page = 1,
      limit = 100 
    } = req.query;

    const indexExists = await esClient.indices.exists({ index: 'emails' });
    if (!indexExists) {
      return res.json({ hits: [], total: 0, page: 1, limit: 100 });
    }

    const must: any[] = [];
    if (query) must.push({ multi_match: { query: query as string, fields: ['subject', 'text', 'from', 'to'], fuzziness: 'AUTO' } });
    if (folder) must.push({ term: { 'folder.keyword': folder as string } });
    if (accountId) must.push({ term: { 'accountId.keyword': accountId as string } });
    if (category) must.push({ term: { 'category.keyword': category as string } });

    const searchBody: any = {
      query: { bool: { must: must.length > 0 ? must : { match_all: {} } } },
      sort: [{ date: { order: 'desc' } }],
      from: (Number(page) - 1) * Number(limit),
      size: Number(limit)
    };

    const result = await esClient.search({
      index: 'emails',
      body: searchBody
    });

    const total = typeof result.hits.total === 'object' ? result.hits.total.value : result.hits.total;

    res.json({
      hits: result.hits.hits.map((hit: any) => ({ id: hit._id, ...hit._source })),
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
    const { folder = '', accountId = '', category = '' } = req.query;

    const indexExists = await esClient.indices.exists({ index: 'emails' });
    if (!indexExists) {
      return res.json({ total: 0, categories: [], folders: [], accounts: [] });
    }

    const must: any[] = [];
    if (folder) must.push({ term: { 'folder.keyword': folder as string } });
    if (accountId) must.push({ term: { 'accountId.keyword': accountId as string } });
    if (category) must.push({ term: { 'category.keyword': category as string } });

    const query = { bool: { must: must.length > 0 ? must : { match_all: {} } } };

    const result = await esClient.search({
      index: 'emails',
      size: 0, 
      aggs: {
        categories: { terms: { field: 'category.keyword', size: 20 } },
        folders: { terms: { field: 'folder.keyword', size: 20 } },
        accounts: { terms: { field: 'accountId.keyword', size: 20 } }
      }
    } as any);
    
    const total = typeof result.hits.total === 'object' ? result.hits.total.value : result.hits.total;
    const aggregations = result.aggregations as any;

    res.json({
      total: total || 0,
      categories: aggregations?.categories?.buckets || [],
      folders: aggregations?.folders?.buckets || [],
      accounts: aggregations?.accounts?.buckets || []
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

app.get('/email/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await esClient.get({ index: 'emails', id });
    res.json({ id: result._id, ...(typeof result._source === 'object' && result._source !== null ? result._source : {}) });
  } catch (error: any) {
    res.status(error.statusCode === 404 ? 404 : 500).json({ error: 'Failed to fetch email' });
  }
});

app.get('/api/accounts', (req, res) => {
  const accounts = emailAccounts.map(acc => ({
    id: acc.user,
    email: acc.user,
    provider: 'Gmail', 
    isConnected: true 
  }));
  res.json(accounts);
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});