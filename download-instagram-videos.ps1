#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Descargador LOCAL de videos de Instagram para Lisar Studio.
  Ejecutar UNA SOLA VEZ de manera local para obtener los archivos MP4.
  NO se ejecuta al visitar la pagina web.

.PREREQUISITES
  yt-dlp:  winget install yt-dlp.yt-dlp
  ffmpeg:  winget install Gyan.FFmpeg

.USAGE
  Desde la raiz del proyecto (lisar-studio-2026/):
    pwsh .\download-instagram-videos.ps1
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$OutputDir = Join-Path $PSScriptRoot "assets\videos\instagram"
$LogFile   = Join-Path $PSScriptRoot "download-log.txt"

$Videos = @(
  [pscustomobject]@{ Num="01"; Title="VFX & CGI Reel";           Url="https://www.instagram.com/p/DaVr7Z4qhgi/" },
  [pscustomobject]@{ Num="02"; Title="Animacion 3D 1";            Url="https://www.instagram.com/p/DaLveFxqqGb/" },
  [pscustomobject]@{ Num="03"; Title="Animacion 3D 2";            Url="https://www.instagram.com/p/DZz2EL9qoJ5/" },
  [pscustomobject]@{ Num="04"; Title="Animacion 3D 3";            Url="https://www.instagram.com/p/DZtiUuyibjB/" },
  [pscustomobject]@{ Num="05"; Title="Animacion 3D 4";            Url="https://www.instagram.com/p/Da65rYBqNu7/" },
  [pscustomobject]@{ Num="06"; Title="Animacion 3D 5";            Url="https://www.instagram.com/p/DY7ZhFsKGZG/" },
  [pscustomobject]@{ Num="07"; Title="Animacion 3D 6";            Url="https://www.instagram.com/p/DURjZrekRcn/" },
  [pscustomobject]@{ Num="08"; Title="Animacion 3D 7";            Url="https://www.instagram.com/p/DP8Jlu6jOX7/" },
  [pscustomobject]@{ Num="09"; Title="Animacion 3D 8";            Url="https://www.instagram.com/p/DWUuR2vFjgd/" },
  [pscustomobject]@{ Num="10"; Title="Motion Graphics Identidad"; Url="https://www.instagram.com/p/DSz1I0NkqnR/" }
)

Write-Host "`n=== LISAR STUDIO - Descargador local de videos Instagram ===" -ForegroundColor Cyan

if (-not (Get-Command yt-dlp -ErrorAction SilentlyContinue)) {
  Write-Host "[ERROR] yt-dlp no encontrado. Instala con: winget install yt-dlp.yt-dlp" -ForegroundColor Red
  exit 1
}

$HasFFmpeg = [bool](Get-Command ffmpeg -ErrorAction SilentlyContinue)
if (-not $HasFFmpeg) {
  Write-Host "[AVISO] ffmpeg no disponible. Se descargara sin conversion H.264/AAC." -ForegroundColor Yellow
}

if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null }

$Success = @(); $Failed = @()
"=== Descarga iniciada: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===" | Out-File $LogFile -Encoding UTF8

foreach ($v in $Videos) {
  $FileName = "instagram-video-$($v.Num).mp4"
  $DestPath = Join-Path $OutputDir $FileName

  Write-Host "`n[$($v.Num)/10] $($v.Title)" -ForegroundColor White
  Write-Host "       URL  : $($v.Url)" -ForegroundColor Gray
  Write-Host "       Dest : $DestPath" -ForegroundColor Gray

  if (Test-Path $DestPath) {
    Write-Host "       [OK] Ya existe, saltando." -ForegroundColor Green
    $Success += $v.Num
    "[$($v.Num)] SKIP: $FileName" | Add-Content $LogFile
    continue
  }

  $ytArgs = @("--no-playlist", "--output", "$OutputDir\instagram-video-$($v.Num).%(ext)s")
  if ($HasFFmpeg) {
    $ytArgs += @("--format", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
                 "--merge-output-format", "mp4",
                 "--postprocessor-args", "ffmpeg:-vcodec libx264 -acodec aac -movflags +faststart")
  } else {
    $ytArgs += @("--format", "best[ext=mp4]/best")
  }
  $ytArgs += $v.Url

  try {
    & yt-dlp @ytArgs 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0 -and (Test-Path $DestPath)) {
      Write-Host "       [OK] Descargado." -ForegroundColor Green
      $Success += $v.Num
      "[$($v.Num)] OK: $FileName" | Add-Content $LogFile
    } else { throw "Archivo no generado." }
  } catch {
    Write-Host "       [FALLO] $_" -ForegroundColor Red
    Write-Host "       Coloca manualmente: $DestPath" -ForegroundColor Yellow
    $Failed += "$($v.Num) - $($v.Title)"
    "[$($v.Num)] FALLO: $($v.Url)" | Add-Content $LogFile
  }
}

Write-Host "`n=== RESUMEN ===" -ForegroundColor Cyan
Write-Host "Exitosos: $($Success.Count)/$($Videos.Count)" -ForegroundColor Green
if ($Failed.Count -gt 0) {
  Write-Host "Fallidos:" -ForegroundColor Red
  $Failed | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
  Write-Host "Carpeta de destino: $OutputDir" -ForegroundColor Yellow
}
Write-Host "Log: $LogFile`n" -ForegroundColor Gray
