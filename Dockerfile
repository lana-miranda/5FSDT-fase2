# Build
FROM node:23.11.0-alpine AS builder
WORKDIR /
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build 

# Production
FROM node:23.11.0-alpine
WORKDIR /
COPY --from=builder /dist ./dist
COPY --from=builder /config.js ./config.js
COPY package*.json ./
COPY /config ./config
RUN npm install --production
CMD npm start