
# Use the official Node.js image as the base image
FROM node:16

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies
RUN npm config set https-proxy http://romanim:Pissword-1077@supportproxy.sky.local:8080
RUN npm install

# Copy the application files
COPY . .

# Expose the port the app runs on
EXPOSE 1313


# Run the application
CMD ["node", "--optimize_for_size", "--max_old_space_size=512", "xinetjs.js"]

