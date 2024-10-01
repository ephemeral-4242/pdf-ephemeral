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
yarn install

# Check if PostgreSQL is installed and running
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed. Please install it and try again."
    exit 1
fi

if ! pg_isready &> /dev/null; then
    echo "PostgreSQL is not running. Please start it and try again."
    exit 1
fi

# Create database if it doesn't exist
DB_NAME="pdf_ephemeral_dev"
if ! psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "Creating database $DB_NAME..."
    createdb "$DB_NAME"
fi

# Generate Prisma client
echo "Generating Prisma client..."
yarn prisma generate

# Check for schema changes and create migrations if necessary
echo "Checking for schema changes..."
if yarn prisma migrate dev --create-only --name "check_for_changes" 2>&1 | grep -q "No schema changes detected"; then
    echo "No schema changes detected."
    # Remove the temporary migration
    rm -rf prisma/migrations/*check_for_changes*
else
    echo "Schema changes detected. Creating and applying migrations..."
    # Apply the created migration
    yarn prisma migrate dev
fi

# Seed the database (uncomment if you have a seed script)
# echo "Seeding the database..."
# yarn prisma db seed

# Check if Docker is running, if not start it
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Attempting to start Docker..."
    
    # Check the operating system
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open -a Docker
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux (assuming systemd)
        sudo systemctl start docker
    elif [[ "$OSTYPE" == "msys"* || "$OSTYPE" == "win32" ]]; then
        # Windows
        start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    else
        echo "Unsupported operating system. Please start Docker manually."
        exit 1
    fi

    # Wait for Docker to start
    echo "Waiting for Docker to start..."
    while ! docker info > /dev/null 2>&1; do
        sleep 1
    done
    echo "Docker has started successfully."
fi

# Launch Qdrant using Docker
echo "Launching Qdrant..."
if [ "$(docker ps -q -f name=qdrant)" ]; then
    echo "Qdrant container is already running."
else
    if [ "$(docker ps -aq -f status=exited -f name=qdrant)" ]; then
        # Cleanup
        docker rm qdrant
    fi
    docker run -d -p 6333:6333 --name qdrant qdrant/qdrant
fi

echo "Setup complete!"
echo "Prisma is configured and migrations are up to date."
echo "Qdrant is running on port 6333"