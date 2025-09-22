FROM node:22

WORKDIR /app

COPY package*.json ./

# Install all dependencies (including dev) for build
RUN npm install

COPY . .

# Build the app (needs Nest CLI + TypeScript)
RUN npm run build

# Remove dev dependencies to slim image
RUN npm prune --production

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
