#Requires -Version 5.1
<#
  Deploy MycoDAO Pulse to the Proxmox guest (default 192.168.0.198).

  Auth (pick one):
  - PuTTY .ppk: -PrivateKeyPpk or $env:VM_SSH_PRIVATE_KEY_PPK (recommended if VM is pubkey-only)
  - Password: $env:VM_PASSWORD / VM_SSH_PASSWORD or MAS repo .credentials.local

  Usage (from repo root):
    .\scripts\deploy-pulse-vm.ps1
    .\scripts\deploy-pulse-vm.ps1 -PrivateKeyPpk "$env:USERPROFILE\.ssh\mycodao_vm.ppk"

  Requires: PuTTY plink.exe on PATH, LAN access to the VM, git + Docker on the VM.
  Set CLOUDFLARE_TUNNEL_TOKEN in /opt/mycodao/.env.production on the VM for tunnel profile.
#>
param(
  [string] $VmHost = "192.168.0.198",
  [string] $VmUser = "mycosoft",
  [string] $RemoteDir = "/opt/mycodao",
  [string] $Branch = "main",
  # PuTTY .ppk path; overrides password when set and file exists
  [string] $PrivateKeyPpk = "",
  # PuTTY plink -hostkey (required in -batch when key not in registry). Update if VM is reinstalled.
  [string] $HostKey = "ssh-ed25519 255 SHA256:bi3g/9ByDiGgwnHV9lrYdBOBVvB5yRv9i+/WbItR67s"
)

$ErrorActionPreference = "Stop"

function Get-VmPassword {
  if ($env:VM_PASSWORD) { return $env:VM_PASSWORD }
  if ($env:VM_SSH_PASSWORD) { return $env:VM_SSH_PASSWORD }
  $candidates = @(
    (Join-Path $PSScriptRoot "..\..\.credentials.local"),
    (Join-Path $PSScriptRoot "..\..\..\MAS\mycosoft-mas\.credentials.local"),
    (Join-Path $env:USERPROFILE ".mycosoft-credentials")
  )
  foreach ($p in $candidates) {
    if (-not (Test-Path $p)) { continue }
    Get-Content $p | ForEach-Object {
      if ($_ -match '^\s*VM_(?:SSH_)?PASSWORD\s*=\s*(.+)\s*$') { return $matches[1].Trim() }
    }
  }
  return $null
}

$ppk = $PrivateKeyPpk
if (-not $ppk) { $ppk = $env:VM_SSH_PRIVATE_KEY_PPK }
if ($ppk -and -not (Test-Path $ppk)) {
  throw "Private key file not found: $ppk"
}

$pass = Get-VmPassword
$plink = Get-Command plink -ErrorAction SilentlyContinue
if (-not $plink) {
  throw "plink.exe not found. Install PuTTY or add plink to PATH."
}

$bash = @"
set -e
cd '$RemoteDir'
if [ ! -d .git ]; then echo 'Missing git repo at $RemoteDir — clone https://github.com/MycosoftLabs/MYCODAO.git first.'; exit 1; fi
git fetch origin
git checkout $Branch
git reset --hard origin/$Branch
docker compose build --no-cache mycodao
docker compose up -d
docker compose --profile tunnel up -d
docker compose ps
"@

Write-Host "Deploying to ${VmUser}@${VmHost}:${RemoteDir} (branch $Branch)..."
$plinkArgs = @("-batch", "-ssh", "${VmUser}@${VmHost}")
if ($HostKey) { $plinkArgs = @("-hostkey", $HostKey) + $plinkArgs }
if ($ppk) {
  $plinkArgs = @("-i", $ppk) + $plinkArgs
  Write-Host "Using PuTTY key: $ppk"
} else {
  if (-not $pass) {
    throw "No VM password and no -PrivateKeyPpk / VM_SSH_PRIVATE_KEY_PPK. MycoDAO VM may require SSH public key: create a .ppk, add pubkey to mycosoft@$VmHost :~/.ssh/authorized_keys, then re-run with -PrivateKeyPpk."
  }
  $plinkArgs = $plinkArgs + @("-pw", $pass)
}

& plink.exe @plinkArgs $bash
Write-Host "Done. Test: https://pulse.mycodao.com/api/health and npm run test:pulse-smoke:prod"
