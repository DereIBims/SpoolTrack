# Quickstart

Get up and running with **SpoolManager** in just a few steps using Docker Compose.

---

## 📥 Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/SpoolManager.git
cd SpoolManager
```

---

## 🐳 Build & Run with Docker Compose

```bash
docker compose up -d --build
```

* Application: [http://localhost:8080](http://localhost:8080)
* API: [http://localhost:8080/api](http://localhost:8080/api)
* API Documentation: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

---

## ⚙️ Configuration

* **Language**: set with environment variable `APP_LANG` (`de` or `en`).

Change that part in the provided 'docker-compose.yml'
```yaml
environment:
  APP_LANG: "de"
```


That’s it! 🎉 Run `docker compose logs -f` to watch logs or `docker compose down` to stop the container.









