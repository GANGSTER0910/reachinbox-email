import { Client } from '@elastic/elasticsearch';
const ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL || 'http://localhost:9200';
export const esClient = new Client({
  node: ELASTIC_SEARCH_URL,
});
