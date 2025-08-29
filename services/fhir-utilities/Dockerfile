# Use the official Node.js 20 image as the base image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json 
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm install --production

# Install production dependencies reproducibly
ENV NODE_ENV=production
RUN npm ci --omit=dev && npm cache clean --force

# Needed for docker-compose healthcheck
USER root
RUN apk add --no-cache curl
USER node

# Copy the rest of the application code
COPY --chown=node:node . .

# Drop privileges
USER node

# Expose the port the app runs on
EXPOSE 4002

# Command to run the application
CMD ["npm", "start"]
