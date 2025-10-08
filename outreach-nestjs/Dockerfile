FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Remove dev dependencies to slim image
RUN npm prune --production

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
