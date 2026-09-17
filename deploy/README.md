# VPS deployment — one-time setup

Do this once on the VPS. After that, every future update is just `bash deploy/deploy.sh`.

## 1. Clone the repo

```bash
git clone https://github.com/mohamedmashalyeng-dot/Apprenticeships-Review.git apprentice
cd apprentice
```

## 2. Create `.env.local` (repo root, next to `backend/`)

This file holds secrets and is gitignored on purpose — it never comes from `git pull`, you
create it once by hand:

```
DATABASE_URL=<same Neon connection string as your local .env.local>
DJANGO_SECRET_KEY=<generate a new random one — don't reuse the local dev one>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=apprenticeships-review.kentbusinesscollege.net
CORS_ALLOWED_ORIGINS=http://apprenticeships-review.kentbusinesscollege.net
GEMINI_API_KEY=<same key as your local .env.local>
```

Generate a secret key: `python3 -c "import secrets; print(secrets.token_urlsafe(50))"`

## 3. Edit the paths in the two deploy config files

Both `deploy/apprenticeships-backend.service` and `deploy/nginx.conf.example` have
`/home/deploy/apprentice` as a placeholder — replace it with wherever you actually cloned
the repo (check with `pwd` from inside it), and replace `User=deploy` / `Group=deploy` in
the service file with the actual Linux user running this.

## 4. Install the systemd service

```bash
sudo cp deploy/apprenticeships-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now apprenticeships-backend
sudo systemctl status apprenticeships-backend   # should say "active (running)"
```

## 5. Install the Nginx site

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/apprenticeships-review
sudo ln -s /etc/nginx/sites-available/apprenticeships-review /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 6. First deploy

```bash
bash deploy/deploy.sh
```

Visit `http://apprenticeships-review.kentbusinesscollege.net` — it should load the site and
API calls (login, providers, reviews) should all work with no separate backend URL needed.

---

**Every update after this**: just `bash deploy/deploy.sh`. It pulls, installs deps,
migrates, builds the frontend, and restarts the backend service.
