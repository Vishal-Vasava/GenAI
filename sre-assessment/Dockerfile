# Simple Nginx static site for SRE Assessment
FROM nginx:1.27-alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static assets to nginx html root
COPY . /usr/share/nginx/html

# Expose default HTTP port
EXPOSE 80

# Health check on index
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1