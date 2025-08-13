# SRE Practice Assessment (Static Web App)

Simple static app with 10 SRE questions, per-question score (0–10), additional info, total score, autosave, JSON export, and print.

## Local run (Node.js)

- Requirements: Node 18+
- Install and start:

```bash
cd /workspace/sre-assessment
npm install --production
npm start
# Open http://localhost:8080
```

## Local run (Python quick server)

```bash
python3 -m http.server 8000 --directory /workspace/sre-assessment
```

## Container image (Nginx)

Build and run (requires Docker or Podman):

```bash
# Build
docker build -t sre-assessment:latest /workspace/sre-assessment
# Run
docker run --rm -p 8080:80 sre-assessment:latest
# Open http://localhost:8080
```

## Deploy options

- Vercel/Netlify/Cloudflare Pages: select this folder as the project root; no build step needed (static).
- GitHub Pages: push this folder to a repo, enable Pages for the `main` branch, `/` root.
- AWS S3 + CloudFront: upload files to S3 bucket (static website hosting), set index to `index.html`.
- Nginx/Apache: serve this directory as the web root; sample Nginx config provided in `nginx.conf`.

## Health check

- Path: `/healthz` returns plain `ok` (works in Node server and Nginx config).