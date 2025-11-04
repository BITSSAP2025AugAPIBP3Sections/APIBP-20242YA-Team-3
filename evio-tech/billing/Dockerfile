# Use official Node image
FROM node:18

# Install netcat (nc) for wait-for-mongo.sh
RUN apt-get update && apt-get install -y netcat-openbsd

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all project files
COPY . .

# Expose port
EXPOSE 4000

# Default command
CMD ["node", "src/server.js"]
