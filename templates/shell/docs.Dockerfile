# Stage 1: Build the MkDocs static site
FROM python:3.12-alpine AS builder
WORKDIR /app
COPY mkdocs.yml ./
COPY docs/ ./docs/
RUN pip install --no-cache-dir mkdocs mkdocs-material && mkdocs build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/site /usr/share/nginx/html

# nginx on port 8080 for Container Apps (non-root friendly)
RUN sed -i 's/listen\s*80;/listen 8080;/' /etc/nginx/conf.d/default.conf
EXPOSE 8080
