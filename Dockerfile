# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Build the application (transpile TypeScript to JavaScript)
RUN npm run build

# Expose the port that the application listens on
EXPOSE 3000

# Define the command to run your application
CMD ["npm", "start"]
