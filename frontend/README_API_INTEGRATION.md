# API Integration Documentation

## Overview
The frontend has been integrated with the backend APIs using axios and React Query for efficient data fetching and state management.

## API Endpoints

### Base URL
- Development: `http://localhost:5000`
- Configurable via `VITE_API_URL` environment variable

### Available Endpoints

1. **GET /search** - Search and filter emails
   - Query parameters: `query`, `folder`, `accountId`, `category`, `from`, `to`, `page`, `limit`
   - Returns: `{ hits: Email[], total: number, page: number, limit: number }`

2. **GET /stats** - Get email statistics
   - Returns: `{ total: number, categories: Array, folders: Array, accounts: Array }`

3. **POST /category** - Categorize email content
   - Body: `{ emailContent: string }`
   - Returns: `{ category: string }`

4. **POST /test-notifications** - Test notification system
   - Returns: `{ success: boolean, message: string }`

## Frontend Integration

### API Service (`src/lib/api.ts`)
- Axios instance with interceptors for logging and error handling
- TypeScript interfaces for all API responses
- Centralized API functions

### React Query Hooks (`src/hooks/useEmails.ts`)
- `useEmails()` - Search emails with filters
- `useEmailStats()` - Get email statistics
- `useCategorizeEmail()` - Categorize email content
- `useTestNotifications()` - Test notifications
- `useEmailsForUI()` - Transformed data for UI components

### Components Updated
1. **EmailList** - Now uses real API data with loading/error states
2. **EmailSidebar** - Shows real statistics from backend
3. **EmailDetail** - Displays actual email content from API

## Features

### Real-time Data
- Automatic refetching with React Query
- Optimistic updates
- Background synchronization

### Error Handling
- Toast notifications for API errors
- Retry mechanisms
- Graceful fallbacks

### Loading States
- Skeleton loaders
- Progress indicators
- Disabled states during operations

### Search & Filtering
- Real-time search across email content
- Category-based filtering
- Account-specific views

## Environment Configuration

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000
VITE_DEV_MODE=true
```

## Development

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. The frontend will automatically connect to the backend API

## Data Flow

1. **Email Fetching**: React Query manages caching and refetching
2. **Search**: Real-time search with debouncing
3. **Filtering**: Server-side filtering for performance
4. **Categorization**: AI-powered email categorization
5. **Statistics**: Real-time stats from Elasticsearch

## Error Handling

- Network errors show toast notifications
- Loading states prevent user confusion
- Retry buttons for failed operations
- Graceful degradation when API is unavailable

## Performance Optimizations

- React Query caching reduces API calls
- Debounced search prevents excessive requests
- Pagination for large email lists
- Background refetching keeps data fresh 