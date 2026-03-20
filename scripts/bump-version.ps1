param(
    [Parameter(Position = 0)]
    [string]$NewVersion,
    [string]$VersionPath = (Join-Path (Split-Path -Path $PSScriptRoot -Parent) "cmd\version.go"),
    [string]$ReadmePath = (Join-Path (Split-Path -Path $PSScriptRoot -Parent) "README.md")
)

$versionPattern = '^\s*(\d+)\.(\d+)\.(\d+)$'

if (-not (Test-Path -LiteralPath $VersionPath)) {
    throw "Version file not found: $VersionPath"
}

$versionFile = Get-Content -Path $VersionPath -Raw
$versionMatch = [regex]::Match($versionFile, 'const\s+Version\s*=\s*"([^"]+)"')

if (-not $versionMatch.Success) {
    throw "Could not locate version constant in $VersionPath"
}

$currentVersion = $versionMatch.Groups[1].Value
if (-not ([regex]::IsMatch($currentVersion, $versionPattern))) {
    throw "Current version '$currentVersion' is not valid semver format (x.y.z)"
}

if ([string]::IsNullOrWhiteSpace($NewVersion)) {
    $parts = $currentVersion -split '\.'
    $nextPatch = [int]$parts[2] + 1
    $NewVersion = '{0}.{1}.{2}' -f $parts[0], $parts[1], $nextPatch
} else {
    if (-not ([regex]::IsMatch($NewVersion, $versionPattern))) {
        throw "Provided version '$NewVersion' must be in x.y.z format"
    }
}

$updated = [regex]::Replace(
    $versionFile,
    'const\s+Version\s*=\s*"[^"]+"',
    "const Version = `"$NewVersion`""
)

Set-Content -Path $VersionPath -Value $updated
Write-Host "Updated version: $currentVersion -> $NewVersion"
Write-Host "File: $VersionPath"

if (-not (Test-Path -LiteralPath $ReadmePath)) {
    Write-Warning "README file not found at: $ReadmePath"
    exit 0
}

$readmeFile = Get-Content -Path $ReadmePath -Raw
$badgePattern = '!\[Static Badge\]\(https://img\.shields\.io/badge/Version-[^)]*\)'
$replacementBadge = "![Static Badge](https://img.shields.io/badge/Version-$NewVersion-orange)"
$badgeMatch = [regex]::Match($readmeFile, $badgePattern)
if (-not $badgeMatch.Success) {
    Write-Warning "Version badge not found in $ReadmePath; skipped README update."
    exit 0
}

$updatedReadme = [regex]::Replace($readmeFile, $badgePattern, $replacementBadge, 1)
Set-Content -Path $ReadmePath -Value $updatedReadme
Write-Host "Updated README badge: $ReadmePath"
