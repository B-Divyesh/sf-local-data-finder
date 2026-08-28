$ErrorActionPreference = "Stop"
$repo = "B-Divyesh/sf-local-data-finder"
$base = "https://github.com/$repo/releases/latest/download"
$manifest = Invoke-RestMethod "$base/latest.json"
$asset = $manifest.assets | Where-Object { $_.platform -eq "windows" -and $_.arch -eq "x86_64" -and $_.format -eq "exe" } | Select-Object -First 1
if (-not $asset) { $asset = $manifest.assets | Where-Object { $_.platform -eq "windows" -and $_.format -eq "msi" } | Select-Object -First 1 }
if (-not $asset) { throw "No Windows installer exists in the latest release." }
$name = [IO.Path]::GetFileName(([Uri]$asset.url).LocalPath)
$destination = Join-Path $env:TEMP $name
Invoke-WebRequest $asset.url -OutFile $destination
$actual = (Get-FileHash $destination -Algorithm SHA256).Hash.ToLowerInvariant()
if ($actual -ne $asset.sha256.ToLowerInvariant()) { Remove-Item $destination; throw "Checksum verification failed; nothing was installed." }
Write-Host "Verified SHA256 and downloaded $destination"
Write-Host "Starting the Local Data Finder installer. The unsigned v0.1 build may show a Windows SmartScreen notice."
Start-Process $destination
