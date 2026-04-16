#Requires -Version 5.1
<#
  Deploy MycoDAO Pulse to the Proxmox guest (default 192.168.0.198).
  Loads VM password from $env:VM_PASSWORD or MAS repo .credentials.local (VM_SSH_PASSWORD / VM_PASSWORD).

  Usage (from repo root):
    .\scripts\deploy-pulse-vm.ps1
    .\scripts\deploy-pulse-vm.ps1 -VmHost "192.168.0.198" -RemoteDir "/opt/mycodao"

  Requires: PuTTY plink.exe on PATH, LAN access to the VM, git + Docker on the VM.
  Set CLOUDFLARE_TUNNEL_TOKEN in /opt/mycodao/.env.production on the VM for tunnel profile.
#>
param(
  [string] $VmHost = "192.168.0.198",
  [string] $VmUser = "mycosoft",
  [string] $RemoteDir = "/opt/mycodao",
  [string] $Branch = "main"
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
  throw "No VM password: set VM_PASSWORD or add VM_PASSWORD to .credentials.local"
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
# plink: accept host key on first connect; run remote bash
echo y | & plink.exe -batch -ssh "${VmUser}@${VmHost}" -pw $pass $bash
Write-Host "Done. Test: https://pulse.mycodao.com/api/health and npm run test:pulse-smoke:prod"
