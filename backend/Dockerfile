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

# Build TypeScript (if needed)
RUN npm run build || true

# Expose backend port
EXPOSE 4000

# Default command: wait for db, run migrations & seeds, then start server
CMD sh -c "until nc -z db 5432; do sleep 1; done && npx knex migrate:latest --knexfile knexfile.ts && npx knex seed:run --knexfile knexfile.ts && npm run dev" 