# Cloudflare — mycodao.com and pulse.mycodao.com (Apr 14, 2026)

## Zone

- Add **`mycodao.com`** to your Cloudflare account (or transfer nameservers from the registrar / Webflow when ready).

## DNS

| Name | Type | Content | Proxied |
|------|------|-----------|---------|
| `pulse` | A | `<MycoDAO_VM_LAN_or_public_IP>` | Yes (orange cloud) or DNS-only if using Tunnel |
| `@` | A or CNAME | Marketing origin (Webflow until migration) | Per current setup |

For **origin on LAN** only: use **Cloudflare Tunnel** (`cloudflared`) from the VM to Cloudflare so no public IP is required.

## SSL/TLS

- **Full (strict)** when the origin presents a valid certificate (Caddy Let’s Encrypt or Cloudflare Origin Certificate on the VM).

## Caching

- **Cache Rules**: bypass cache for HTML document path `/` and `/pulse` (or all `text/html`).
- **Cache** long-lived assets: `/_next/static/*` with long edge TTL.

## Firewall

- If exposing the VM: restrict **80/443** to Cloudflare IP ranges (or use Tunnel only).
