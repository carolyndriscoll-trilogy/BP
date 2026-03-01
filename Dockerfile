FROM node:22-slim

WORKDIR /app

# Install only the OS-level deps we actually need (sharp uses libvips)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the app (client + server)
RUN npm run build

# Expose the port Railway will set
EXPOSE ${PORT:-10000}

# Start the production server
CMD ["npm", "run", "start"]
