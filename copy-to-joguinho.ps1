$ErrorActionPreference = "Stop"
$source = Split-Path -Parent $MyInvocation.MyCommand.Path
$target = "C:\Users\carlo\OneDrive\Área de Trabalho\joguinho"

New-Item -ItemType Directory -Force -Path $target | Out-Null
Get-ChildItem -LiteralPath $source -Force |
  Where-Object { $_.Name -notin @("node_modules", ".git") } |
  Copy-Item -Destination $target -Recurse -Force

Write-Host "Merge Drop React copiado para $target"
