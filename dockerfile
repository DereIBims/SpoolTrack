# --- Frontend Build ---
FROM node:20-alpine AS fe
WORKDIR /app
COPY frontend/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm install
COPY frontend/ ./
RUN npm run build

# --- Runtime: Python + Nginx + Supervisor ---
FROM python:3.12-alpine
WORKDIR /srv

# System-Pakete
RUN apk add --no-cache nginx gettext supervisor

# Backend rein + deps
COPY backend/ /srv/backend/
RUN pip install --no-cache-dir -r /srv/backend/requirements.txt \
    && pip install --no-cache-dir gunicorn uvicorn

# Frontend-Assets nach Nginx
COPY --from=fe /app/dist /usr/share/nginx/html

# Configs
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisord.conf
COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 80
ENV APP_LANG=de
ENTRYPOINT ["/entrypoint.sh"]
