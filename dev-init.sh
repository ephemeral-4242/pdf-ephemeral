#!/bin/bash

# Set the path to your backend directory
BACKEND_DIR="./apps/backend"

# Change to the backend directory
cd "$BACKEND_DIR"

# Check if .env file exists, if not create it
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "DATABASE_URL=\"postgresql://pdf_user:your_secure_password@localhost:5432/pdf_ephemeral_dev?schema=public\"" > .env
    echo "Please update the DATABASE_URL in .env with your actual database credentials."
else
    echo ".env file already exists. Make sure it contains the correct DATABASE_URL."
fi

# Generate Prisma client
echo "Generating Prisma client..."
yarn prisma generate

# Reset the database (this will drop the database, recreate it, and apply all migrations)
echo "Resetting database..."
yarn prisma migrate reset --force

# Seed the database (uncomment if you have a seed script)
# echo "Seeding the database..."
# yarn prisma db seed

# Launch Qdrant using Docker
echo "Launching Qdrant..."
docker run -d -p 6333:6333 --name qdrant qdrant/qdrant

echo "Prisma setup complete!"
echo "Qdrant is running on port 6333"