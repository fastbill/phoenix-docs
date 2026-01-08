FROM node:18-alpine

WORKDIR /app

# Install dependencies first (for caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY astro.config.mjs tsconfig.json ./
COPY src/ ./src/
COPY scripts/ ./scripts/
COPY templates/ ./templates/

# Make scripts executable
RUN chmod +x /app/scripts/*.sh /app/scripts/*.mjs

# Create placeholder for generated sidebar
RUN echo "export const sidebar = [];" > /app/src/sidebar.generated.mjs

# Expose dev server port
EXPOSE 4321

ENTRYPOINT ["/app/scripts/entrypoint.sh"]
CMD ["help"]
