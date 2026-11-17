#requires -Version 5.1
<#
.SYNOPSIS
Installs spec2cloud from a GitHub branch or tag using native PowerShell commands.
#>
[CmdletBinding()]
param(
    [switch]$Minimal,

    [Alias('Branch', 'Tag', 'Version')]
    [ValidateNotNullOrEmpty()]
    [string]$Ref = 'vNext',

    [ValidateNotNullOrEmpty()]
    [string]$Target = '.',

    [switch]$Help
)

if ($Help) {
    Write-Output @'
Spec2Cloud Quick Install Script

Usage: .\quick-install.ps1 [-Minimal] [-Ref REF] [-Target DIR] [-Help]

OPTIONS:
  -Minimal            Install skills, AGENTS.md, skills-lock.json and .spec2cloud
  -Ref REF            Branch or tag to install from (default: vNext)
  -Branch BRANCH      Alias for -Ref
  -Tag TAG            Alias for -Ref
  -Version VERSION    Alias for -Ref
  -Target DIR         Install to a specific directory (default: current)
  -Help               Show this help message

EXAMPLES:
  .\quick-install.ps1
  .\quick-install.ps1 -Minimal
  .\quick-install.ps1 -Ref feature/new-skills
  .\quick-install.ps1 -Tag v2.0.0 -Target 'C:\My Project'
'@
    return
}

$ErrorActionPreference = 'Stop'
$repository = 'EmeaAppGbb/spec2cloud'
# Encode each segment without turning branch separators into escaped slashes.
$encodedRef = (($Ref -split '/') | ForEach-Object {
    [Uri]::EscapeDataString($_)
}) -join '/'
$archiveUrl = "https://github.com/$repository/archive/$encodedRef.zip"
$temporaryDirectory = $null

function Copy-InstallerDirectory {
    param(
        [string]$Source,
        [string]$Destination
    )

    New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    # Enumerate every level explicitly: wildcards and recursive copies can omit hidden items.
    foreach ($item in Get-ChildItem -LiteralPath $Source -Force) {
        $destinationPath = Join-Path $Destination $item.Name
        if ($item.PSIsContainer) {
            Copy-InstallerDirectory -Source $item.FullName -Destination $destinationPath
        }
        else {
            Copy-Item -LiteralPath $item.FullName -Destination $destinationPath -Force
        }
    }
}

try {
    $temporaryDirectory = Join-Path ([IO.Path]::GetTempPath()) (
        'spec2cloud-' + [Guid]::NewGuid().ToString('N')
    )
    New-Item -ItemType Directory -Path $temporaryDirectory | Out-Null
    $archivePath = Join-Path $temporaryDirectory 'spec2cloud.zip'
    $extractionPath = Join-Path $temporaryDirectory 'extracted'

    $mode = 'full'
    if ($Minimal) {
        $mode = 'minimal'
    }
    Write-Host "Installing spec2cloud ($mode) from ref '$Ref' to '$Target'..."
    Invoke-WebRequest -UseBasicParsing -Uri $archiveUrl -OutFile $archivePath
    Expand-Archive -LiteralPath $archivePath -DestinationPath $extractionPath -Force

    $roots = @(Get-ChildItem -LiteralPath $extractionPath -Directory -Force)
    if ($roots.Count -ne 1) {
        throw 'Archive must contain exactly one repository directory.'
    }

    $sourceRoot = $roots[0].FullName
    $skillsPath = Join-Path $sourceRoot '.github/skills'
    if (-not (Test-Path -LiteralPath $skillsPath -PathType Container)) {
        throw 'Archive is missing .github/skills - not a valid spec2cloud archive.'
    }

    Copy-InstallerDirectory -Source $skillsPath -Destination (Join-Path $Target '.github/skills')

    $statePath = Join-Path $sourceRoot '.spec2cloud'
    if (Test-Path -LiteralPath $statePath -PathType Container) {
        Copy-InstallerDirectory -Source $statePath -Destination (Join-Path $Target '.spec2cloud')
    }

    $files = @('AGENTS.md', 'skills-lock.json')
    if (-not $Minimal) {
        $files += @(
            '.github/copilot-instructions.md',
            '.github/lsp.json',
            '.mcp.json',
            '.vscode/mcp.json',
            '.devcontainer/devcontainer.json'
        )
    }

    foreach ($relativePath in $files) {
        $sourcePath = Join-Path $sourceRoot $relativePath
        if (Test-Path -LiteralPath $sourcePath -PathType Leaf) {
            $destinationPath = Join-Path $Target $relativePath
            New-Item -ItemType Directory -Path (Split-Path -Parent $destinationPath) -Force | Out-Null
            Copy-Item -LiteralPath $sourcePath -Destination $destinationPath -Force
        }
    }

    foreach ($directory in @('features', 'tasks', 'docs', 'domain')) {
        New-Item -ItemType Directory -Path (Join-Path $Target "specs/$directory") -Force | Out-Null
    }
}
catch {
    throw "Spec2Cloud installation failed from '$archiveUrl': $($_.Exception.Message)"
}
finally {
    if ($temporaryDirectory -and (Test-Path -LiteralPath $temporaryDirectory)) {
        Remove-Item -LiteralPath $temporaryDirectory -Recurse -Force
    }
}

Write-Host 'Spec2Cloud installation complete!'
Write-Host 'Open your project in VS Code with GitHub Copilot to begin your workflow.'
