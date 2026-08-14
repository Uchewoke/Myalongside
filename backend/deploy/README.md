# Backend VM Deployment

One-time setup for running the MyAlongside API on a plain Linux VM
(DigitalOcean, Hetzner, EC2, etc.), fronted by Nginx + Let's Encrypt, kept
alive by systemd. See the files in this directory:

- `nginx/api.myalongside.com.conf` — reverse proxy + TLS termination
- `systemd/myalongside-backend.service` — process supervision
- `deploy.sh` — pulls, builds, migrates, restarts on every deploy

## Prerequisites

- A VM running Ubuntu 22.04+ (or similar), reachable over SSH, with a public IP.
- DNS control for `myalongside.com` (to point `api.myalongside.com` at the VM).
- The production `DATABASE_URL` and other secrets from `.env.production.example`.

## 1. Provision the VM

Smallest tier is fine to start (1-2GB RAM). Note its public IPv4 address —
you'll need it for the DNS step.

## 2. Create an unprivileged deploy user

Run as root on the VM:

```bash
adduser --disabled-password --gecos "" deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/   # or add your own key
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys
```

From here on, SSH in as `deploy`, not root.

## 3. Install Node.js, git, nginx, certbot

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx certbot python3-certbot-nginx
node -v   # confirm Node 20+
```

## 4. Clone the repo and configure secrets

```bash
sudo mkdir -p /var/www/myalongside
sudo chown deploy:deploy /var/www/myalongside
git clone <your-repo-url> /var/www/myalongside
cd /var/www/myalongside
cp .env.production.example backend/.env
```

Edit `backend/.env` and fill in real values — `DATABASE_URL`, `JWT_SECRET`,
`JWT_REFRESH_SECRET`, Stripe keys, etc. (see `.env.production.example` for
the full list). Never commit this file.

## 5. Point DNS at the VM

Add an **A record**: `api.myalongside.com` → the VM's public IPv4 address.
Wait for it to propagate (`dig api.myalongside.com` should return the IP)
before continuing — certbot needs this to issue a certificate.

## 6. Install the Nginx config and get a TLS certificate

```bash
sudo cp backend/deploy/nginx/api.myalongside.com.conf \
        /etc/nginx/sites-available/api.myalongside.com
sudo ln -s /etc/nginx/sites-available/api.myalongside.com \
           /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

sudo certbot --nginx -d api.myalongside.com
```

Certbot rewrites the 443 block's cert paths and sets up auto-renewal.

## 7. Install the systemd service

```bash
sudo cp backend/deploy/systemd/myalongside-backend.service \
        /etc/systemd/system/myalongside-backend.service
sudo systemctl daemon-reload
sudo systemctl enable myalongside-backend
```

Double-check the `User`, `WorkingDirectory`, and `EnvironmentFile` paths in
the unit file match where you actually cloned the repo (defaults assume
`/var/www/myalongside/backend` and user `deploy`).

## 8. Allow the deploy user to restart the service without a password

```bash
sudo visudo -f /etc/sudoers.d/myalongside
```

Add this line, then save:

```
deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart myalongside-backend
```

This is scoped to exactly one command — `deploy` still can't run arbitrary
sudo commands.

## 9. First deploy

```bash
cd /var/www/myalongside
./backend/deploy/deploy.sh
```

This installs dependencies, applies Prisma migrations, builds the backend,
starts the service, and polls `/health` to confirm it's live.

## 10. Verify

```bash
curl https://api.myalongside.com/health
# {"status":"ok","timestamp":"..."}
```

Also confirm the admin app's `BACKEND_URL` (in its Vercel env vars) points
at `https://api.myalongside.com`.

## Subsequent deploys

SSH in as `deploy` and re-run the same script:

```bash
cd /var/www/myalongside && ./backend/deploy/deploy.sh
```

## Troubleshooting

- **Service won't start:** `sudo journalctl -u myalongside-backend -n 100 --no-pager`
- **Nginx 502:** the Node process isn't listening on `127.0.0.1:4000` — check
  the service status (`systemctl status myalongside-backend`) and that
  `PORT` in `backend/.env` is `4000` (or matches the nginx upstream).
- **Cert renewal:** certbot installs a systemd timer automatically; verify
  with `sudo certbot renew --dry-run`.
