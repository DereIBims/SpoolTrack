# Installation

This guide covers **development (Dev)** and **production (Docker Compose)** setup.
Frontend: React (Vite) • Backend: FastAPI (Uvicorn/Gunicorn) • DB: SQLite

## Table of Contents

* [Prerequisites](#prerequisites)
* [Clone Repository](#clone-repository)
* [Development (without Docker)](#development-without-docker)

  * [Start Frontend](#start-frontend)
  * [Start Backend](#start-backend)
  * [i18n in Dev](#i18n-in-dev)
* [Production (Docker Compose)](#production-docker-compose)

  * [First Start](#first-start)
  * [Settings](#Settings)
* [Docker – Useful Commands](#docker--useful-commands)

---

## Prerequisites

* **Node.js** 20+
* **Python** 3.11+
* **Docker** & **Docker Compose** (for production)

---

## Clone Repository

```bash
git clone https://github.com/DereIBims/SpoolManager.git
cd SpoolManager
```

Project structure (simplified):

```
.
├─ frontend/        # React + Vite
├─ backend/         # FastAPI
│  ├─ requirements.txt
│  └─ app
│     ├─ db.py
│     ├─ models.py
│     ├─ utils.py
│     ├─ main.py
│     └─ __init__.py
├─ docker-compose.yml
├─ Dockerfile
├─ nginx.conf
├─ supervisord.conf
└─ entrypoint.sh
```

---

## Development (without Docker)

### Start Frontend

```bash
cd frontend
npm install
npm run dev
```

* Dev server: [http://localhost:5173](http://localhost:5173)


### Start Backend

Do this in a seperate console window/tab since both processes need to run

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
```
The virtual environment is used to not touch your python installation.
You can also skip those two commands

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

```

* API: [http://localhost:8000](http://localhost:8000)
* API documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
* Default DB: SQLite (file in backend dir or via Env var).

### Language in Dev

* Runtime config: `frontend/public/config.js`

  ```js
  window.__APP_CONFIG__ = { LANG: "de" } // or "en"
  ```
* You can add more languages by adding translations to '/frontend/public/locales'

---

## Production (Docker Compose)

### First Start

> **Note:** Compose builds the image and starts Frontend+Backend+Nginx inside **one container**.
> `/api/*` is proxied internally to the backend (Gunicorn/Uvicorn) → **no CORS** issues.

```bash
# build & start detached
docker compose up -d --build
```
If you encounter any problems, then start the container attached to view the log output:
```bash
docker compose up --build
```

* App: [http://localhost:8080](http://localhost:8080)

### Settings

SQLite DB is mounted at `/srv/data/filament.db` inside the container.
Mount host folder via `docker-compose.yml`:

```yaml
services:
  filament:
    build: .
    container_name: filament
    ports:
      - "8080:80"
    environment:
      APP_LANG: "de"
    volumes:
      - ./data:/srv/data
    restart: unless-stopped
```
You can change the language to english with 'APP_LANG: "en"'
You can also change the port to anything you like, by changing the '8080' from the part '8080:80'

## Docker – Useful Commands

**Rebuild & start**

```bash
docker compose up -d --build
```

**Build without cache**

```bash
docker compose build --no-cache
docker compose up -d
```

**Logs**

```bash
docker compose logs -f
```

**Stop & cleanup**

```bash
docker compose down
```

**Shell into container**

```bash
docker compose exec filament sh
```
