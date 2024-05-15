FROM node:18-alpine

#working directory
WORKDIR /app

#Copy Package Json Files
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy source files
COPY . .

#Start the application
CMD ["node", "Server.js"]