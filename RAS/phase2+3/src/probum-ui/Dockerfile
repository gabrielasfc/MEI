# Use an official Node.js image as the base image
FROM node:latest

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json .
COPY package-lock.json .

# Install dependencies
RUN npm install

# Copy the entire project to the working directory
COPY . .

# Expose port 8071 (assuming your React app runs on this port)
EXPOSE 8071

# Start the React app using npm start
CMD ["npm", "start"]
