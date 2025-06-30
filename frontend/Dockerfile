# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the frontend source
COPY . .

# Expose frontend port
EXPOSE 3000

# Default command: start Next.js in dev mode
CMD ["npm", "run", "dev"] 