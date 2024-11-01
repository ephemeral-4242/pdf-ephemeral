#!/bin/bash

# Set the path to your backend directory
BACKEND_DIR="./apps/backend"

# Change to the backend directory
cd "$BACKEND_DIR" || exit

# Check if .env file exists, if not create it
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "DATABASE_URL=\"postgresql://pdf_user:your_secure_password@localhost:5432/pdf_ephemeral_dev?schema=public\"" > .env
    echo "Please update the DATABASE_URL in .env with your actual database credentials."
else
    echo ".env file already exists. Make sure it contains the correct DATABASE_URL."
fi

# Install dependencies
echo "Installing dependencies..."
bun install

# Create database and run migrations
echo "Setting up database..."
bunx prisma generate
node -r esbuild-register scripts/create-database.ts

# Launch Qdrant using Docker
echo "Launching Qdrant..."
if [ "$(docker ps -q -f name=qdrant)" ]; then
    echo "Qdrant container is already running."
else
    if [ "$(docker ps -aq -f status=exited -f name=qdrant)" ]; then
        docker rm qdrant
    fi
    docker run -d -p 6333:6333 --name qdrant qdrant/qdrant
fi

echo "Setup complete!"
echo "Prisma is configured and migrations are up to date."
echo "Qdrant is running on port 6333"