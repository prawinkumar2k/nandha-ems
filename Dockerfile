FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile
COPY . .
# Build the client statically
RUN pnpm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod --no-frozen-lockfile
# Copy server source
COPY server/ ./server/
# Copy static built assets
COPY --from=builder /app/client/dist ./client/dist

# Security Hardening
RUN addgroup -S neclms && adduser -S neclms -G neclms
RUN chown -R neclms:neclms /app
USER neclms

EXPOSE 8080
CMD ["npm", "run", "start"]
