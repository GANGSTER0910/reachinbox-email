# ReachInbox: AI-Powered Email Client

## Overview

This project is a full-stack, AI-powered email client designed to intelligently categorize and manage your inbox. The application features a modern, responsive frontend built with **React** and **Vite**, a robust backend powered by **Node.js** and **Express**, and **Elasticsearch** for high-speed search and analytics.

The core feature is its ability to use AI, powered by **Groq** and **Langchain**, to automatically categorize incoming emails into labels like "Interested," "Spam," or "Meeting Booked," helping users focus on what's important.

## Key Features

-   **Real-time Email Sync**: Fetches and displays new emails automatically without needing to refresh.
-   **AI-Powered Categorization**: Intelligently classifies incoming emails using a large language model to keep your inbox organized.
-   **Advanced Search & Filtering**: Lightning-fast search across your entire email history, with filters for accounts, folders, and AI-generated categories.
-   **Dynamic Statistics**: An interactive sidebar that displays real-time counts of your emails, which update as you apply filters.
-   **Secure & Scalable**: Built with a modern technology stack, ensuring the application is both secure and ready to scale.
-   **Developer Friendly**: The project is containerized and easy to set up for local development.

## Technology Stack

-   **Frontend**: React, Vite, TypeScript, Tailwind CSS, Axios, React Query
-   **Backend**: Node.js, Express, TypeScript
-   **Database**: Elasticsearch
-   **AI & Machine Learning**: Groq, Langchain
-   **Real-time Services**: node-imap

## Setup and Installation

### Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn
-   Docker and Docker Compose

### 1. Environment Configuration

You will need to create a `.env` file in both the `frontend` and `backend` directories.

#### Backend (`/backend/.env`)

```env
# Email Account Credentials
EMAIL_USER="your-primary-email@gmail.com"
EMAIL_PASS="your-gmail-app-password"
EMAIL_USER_2="your-secondary-email@gmail.com"
EMAIL_PASS_2="your-secondary-app-password"

# Groq API Keys (add as many as you have)
GROQ_API_KEY_1="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxx"
GROQ_API_KEY_2="gsk_yyyyyyyyyyyyyyyyyyyyyyyyyy"

## Frontend
Frontend =https://reachinbox-email-assignment.vercel.app/

## Docker
docker-compose up -d

## Backend
# Go to the backend folder
cd backend

# Install dependencies
npm install

# Start the development server
npm run dev