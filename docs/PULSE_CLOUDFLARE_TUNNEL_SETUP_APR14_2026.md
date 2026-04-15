# Pulse — Cloudflare Tunnel for pulse.mycodao.com — April 14, 2026

## What this does

- **`https://pulse.mycodao.com`** reaches the MycoDAO Next.js app (Pulse dashboard) via **Cloudflare Tunnel** (`cloudflared`).
- **Does not change** the marketing site: leave **`mycodao.com`** and **`www.mycodao.com`** pointing at **Webflow** as they do today. Only the **`pulse`** hostname is added for the app.

## Architecture

| Hostname | Traffic |
|----------|---------|
| `mycodao.com`, `www.mycodao.com` | Unchanged — Webflow (or your current CNAME/A). **Do not** repoint these for Pulse. |
| `pulse.mycodao.com` | Cloudflare Tunnel → Docker service `mycodao:3004` (HTTP inside the bridge network). |

Edge HTTPS is terminated at Cloudflare. The tunnel is encrypted; the origin can use HTTP to the app container.

Visiting `https://pulse.mycodao.com/` **redirects to `/pulse`** (see root `middleware.js`).

## One-time: create the tunnel (Cloudflare Zero Trust)

1. Log in to [Cloudflare One](https://one.dash.cloudflare.com/) → **Networks** → **Tunnels** → **Create a tunnel**.
2. Choose **Cloudflared** → name it (e.g. `mycodao-pulse`).
3. **Public hostname**
   - **Subdomain:** `pulse`
   - **Domain:** `mycodao.com`
   - **Path:** (leave empty for all paths)
   - **Service type:** HTTP
   - **URL:** `http://mycodao:3004`  
     Use this exact hostname if **`cloudflared` runs in the same Docker Compose stack** as the `mycodao` service (same user-defined bridge network).
   - If you run `cloudflared` on the **host OS** instead (not in Compose), use `http://127.0.0.1:3004` (or `localhost:3004`).
4. Save. Cloudflare will offer to create/update the **DNS** record for `pulse.mycodao.com` as a **CNAME** to the tunnel — **only** this name is touched; apex/`www` stay as-is for Webflow.
5. Copy the **tunnel token** (or use the install command’s token) for the next step.

## Server: run the tunnel with Docker

1. In `.env.production` on the VM (or `.env` loaded by Compose), set:

   ```bash
   CLOUDFLARE_TUNNEL_TOKEN=<paste token from dashboard>
   ```

2. Start app + tunnel (no Caddy required for public HTTPS when using the tunnel):

   ```bash
   docker compose up -d --build
   docker compose --profile tunnel up -d
   ```

3. Check logs: `docker compose logs -f cloudflared`

Do **not** commit `CLOUDFLARE_TUNNEL_TOKEN`.

## Local quick test (optional)

Install [`cloudflared`](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/) on your PC, then with the app running on port 3004:

```bash
cloudflared tunnel --url http://localhost:3004
```

Use a **temporary** Cloudflare try hostname or a **separate** dev tunnel in Zero Trust; production should use the token + Compose service URL `http://mycodao:3004` on the VM.

## TLS profile vs tunnel

- **`--profile tls`** (Caddy): use when you want Let’s Encrypt on the VM and public DNS **A** record to your IP.
- **`--profile tunnel`** (`cloudflared`): use when the origin has **no** public inbound ports; Cloudflare connects outbound. You typically **do not** need both for the same hostname — pick one for `pulse.mycodao.com`.

## Verify

```bash
npm run test:pulse-smoke:prod
```

## Related

- `docker-compose.yml` — `tunnel` profile (`cloudflare/cloudflared`).
- `docs/CLOUDFLARE_MYCODAO_APR14_2026.md` — zone/DNS overview.
- `docs/PULSE_MYCODAO_COM_DEPLOY_AND_TEST_APR14_2026.md` — VM bootstrap and Caddy alternative.
