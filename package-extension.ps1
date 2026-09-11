# ==============================================================================
# OmniDub - Chrome Web Store Production Packaging Script
# Creates a clean, store-ready ZIP archive without source-control or dev files.
# ==============================================================================

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

$manifestPath = Join-Path $scriptDir "manifest.json"
if (-not (Test-Path $manifestPath)) {
    Write-Error "manifest.json not found in $scriptDir"
    exit 1
}

# Parse version from manifest.json
$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
$version = $manifest.version
if (-not $version) {
    $version = "1.0.0"
}

$zipFileName = "OmniDub-v$version.zip"
$zipFilePath = Join-Path $scriptDir $zipFileName

if (Test-Path $zipFilePath) {
    Remove-Item -Path $zipFilePath -Force
    Write-Host "Removed existing archive: $zipFileName" -ForegroundColor Yellow
}

# Directories and files to include
$includeItems = @(
    "manifest.json",
    "icons",
    "popup",
    "background",
    "content_scripts",
    "offscreen",
    "services",
    "utils"
)

# Temporary staging directory
$stagingDir = Join-Path $scriptDir "_build_staging"
if (Test-Path $stagingDir) {
    Remove-Item -Path $stagingDir -Recurse -Force
}
New-Item -Path $stagingDir -ItemType Directory | Out-Null

Write-Host "Staging production files for OmniDub v$version..." -ForegroundColor Cyan

foreach ($item in $includeItems) {
    $sourcePath = Join-Path $scriptDir $item
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $stagingDir -Recurse -Force
        Write-Host "  [+] Included: $item" -ForegroundColor Green
    } else {
        Write-Warning "  [!] Missing optional item: $item"
    }
}

# Compress staging directory into ZIP
Write-Host "Creating zip package: $zipFileName..." -ForegroundColor Cyan
Compress-Archive -Path "$stagingDir\*" -DestinationPath $zipFilePath -CompressionLevel Optimal

# Cleanup staging
Remove-Item -Path $stagingDir -Recurse -Force

$zipSize = (Get-Item $zipFilePath).Length / 1KB
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  Success! Package created: $zipFileName ($([math]::Round($zipSize, 1)) KB)" -ForegroundColor Green
Write-Host "  Location: $zipFilePath" -ForegroundColor Green
Write-Host "  Ready for Chrome Web Store Developer Dashboard upload!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

