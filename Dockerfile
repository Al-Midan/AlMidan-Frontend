# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the source code and build the application
COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine AS runtime

WORKDIR /app

# Copy the built application and production dependencies
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json /app/package-lock.json ./
RUN npm install --production

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
