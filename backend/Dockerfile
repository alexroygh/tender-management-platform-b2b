# Use official Node.js image
FROM node:18-alpine

# Install PostgreSQL client for pg_isready
RUN apk add --no-cache postgresql-client

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the backend source
COPY . .

# Build TypeScript
RUN npm run build

# Expose backend port
EXPOSE 4000

# Default command: wait for db, run migrations & seeds, then start server
CMD sh -c "npx knex migrate:latest --env production && npx knex seed:run --env production && npm run dev"
