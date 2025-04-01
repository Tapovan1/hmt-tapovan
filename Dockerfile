# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files to /app
COPY . .

# Expose port 3000 for Next.js
EXPOSE 3000

# Run Next.js in development mode
CMD ["npm", "run", "dev"]
