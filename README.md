# PDF Ephemeral Project

## Overview

PDF Ephemeral is a web application that allows users to upload PDF documents and interact with their content through a chat interface. The application uses OpenAI for generating embeddings and Qdrant for vector storage and search.

## Features

- Upload PDF documents
- Chat with the content of the uploaded PDFs
- Organize PDFs into folders
- View and manage uploaded PDFs
- Supports multiple languages

## Prerequisites

Before setting up the project, ensure you have the following installed:

- Node.js (v14 or later)
- Yarn
- PostgreSQL
- Docker (for running Qdrant)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/pdf-ephemeral.git
cd pdf-ephemeral
```

### 2. Install Dependencies

Navigate to the backend and frontend directories and install dependencies:

```bash
cd apps/backend
yarn install

cd ../frontend
yarn install
```

### 3. Set Up Environment Variables

Navigate to the backend directory and create a `.env` file:

```bash
cd ../backend
cp .env.example .env
```

Update the `.env` file with your actual database credentials and API keys:

```env
DATABASE_URL="postgres://pdf_user:password@localhost:5432/pdf_ephemeral_dev"
OPENAI_API_KEY="your_openai_api_key"
QDRANT_API_KEY="your_qdrant_api_key"
```

### 4. Initialize the Development Environment

Run the initialization script to set up the backend environment:

```bash
./dev-init.sh
```

This script will:

- Navigate to the backend directory
- Create a `.env` file if it doesn't exist
- Install dependencies
- Check if PostgreSQL is installed and running
- Create the database if it doesn't exist
- Grant necessary permissions to the PostgreSQL user
- Generate the Prisma client
- Check for schema changes and create migrations if necessary
- Launch Qdrant using Docker

### 5. Start the Development Servers

To start both the backend and frontend development servers, run:

```bash
yarn dev
```

IN BOTH RESPECTIVELY

This will start the backend server on `http://localhost:4000` and the frontend server on `http://localhost:3000`.

### 6. Access the Application

Open your browser and navigate to `http://localhost:3000` to access the frontend application.

## Project Structure

- `apps/backend`: Contains the backend code (NestJS)
- `apps/frontend`: Contains the frontend code (Next.js)
- `apps/backend/src/modules`: Contains the main modules for the backend
- `apps/frontend/src/components`: Contains the main components for the frontend

## Backend

The backend is built using NestJS and Prisma. It provides RESTful APIs for managing PDFs and folders, as well as interacting with the OpenAI and Qdrant services.

### Key Files

- `src/main.ts`: Entry point for the backend application
- `src/app.module.ts`: Main module for the backend application
- `src/modules/controllers`: Contains the controllers for handling HTTP requests
- `src/modules/services`: Contains the services for business logic
- `src/modules/repositories`: Contains the repositories for database interactions
- `src/modules/interface`: Contains the interfaces for type definitions

### Environment Variables

The backend uses the following environment variables:

- `DATABASE_URL`: URL for the PostgreSQL database
- `OPENAI_API_KEY`: API key for OpenAI
- `QDRANT_API_KEY`: API key for Qdrant

### Running Tests

To run the backend tests, use:

```bash
yarn test
```

## Frontend

The frontend is built using Next.js and Tailwind CSS. It provides a user interface for uploading and interacting with PDFs.

### Key Files

- `src/app/layout.tsx`: Main layout component for the application
- `src/app/page.tsx`: Home page component
- `src/components`: Contains the main components for the frontend
- `src/api`: Contains the API functions for interacting with the backend
