# Spec2Cloud Installation Script (PowerShell)
# Installs spec2cloud agents, prompts, and configurations into existing projects

param(
    [Parameter(Position=0)]
    [string]$TargetDir = ".",
    
    [switch]$Full,
    [switch]$AgentsOnly,
    [switch]$Merge = $true,
    [switch]$Force,
    [switch]$NoColor,
    [switch]$Help
)

$VERSION = "1.0.0"
$ErrorActionPreference = "Stop"

# Script location
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PackageRoot = Split-Path -Parent $ScriptDir

# Color support
if (-not $NoColor -and $Host.UI.SupportsVirtualTerminal) {
    $RED = "`e[31m"
    $GREEN = "`e[32m"
    $YELLOW = "`e[33m"
    $BLUE = "`e[34m"
    $BOLD = "`e[1m"
    $NC = "`e[0m"
} else {
    $RED = $GREEN = $YELLOW = $BLUE = $BOLD = $NC = ""
}

function Write-Header {
    Write-Host "${BLUE}${BOLD}" -NoNewline
    Write-Host "╔═══════════════════════════════════════════════════════════╗"
    Write-Host "║                    Spec2Cloud Installer                   ║"
    Write-Host "║            AI-Powered Development Workflows               ║"
    Write-Host "╚═══════════════════════════════════════════════════════════╝"
    Write-Host "${NC}"
}

function Write-Usage {
    @"
Usage: install.ps1 [OPTIONS] [TARGET_DIR]

Install spec2cloud into an existing project.

OPTIONS:
  -Full              Install everything (agents, prompts, devcontainer, MCP)
  -AgentsOnly        Install only agents and prompts (minimal)
  -Merge             Merge with existing configurations (default)
  -Force             Overwrite existing files without prompting
  -NoColor           Disable colored output
  -Help              Show this help message

TARGET_DIR:
  Directory to install into (default: current directory)

EXAMPLES:
  # Full installation in current directory
  .\install.ps1 -Full

  # Install only agents and prompts
  .\install.ps1 -AgentsOnly

  # Install into specific project
  .\install.ps1 -Full C:\path\to\my-project

  # Force overwrite existing installation
  .\install.ps1 -Full -Force

"@
}

function Log-Info {
    param([string]$Message)
    Write-Host "${BLUE}ℹ${NC} $Message"
}

function Log-Success {
    param([string]$Message)
    Write-Host "${GREEN}✓${NC} $Message"
}

function Log-Warning {
    param([string]$Message)
    Write-Host "${YELLOW}⚠${NC} $Message"
}

function Log-Error {
    param([string]$Message)
    Write-Host "${RED}✗${NC} $Message"
}

function Test-GitRepo {
    if (-not (Test-Path "$TargetDir\.git")) {
        Log-Warning "Not a git repository. Spec2cloud works best with git."
        $response = Read-Host "Continue anyway? (y/N)"
        if ($response -notmatch "^[Yy]$") {
            exit 1
        }
    }
}

function Test-ExistingInstallation {
    if ((Test-Path "$TargetDir\.github\agents") -and -not $Force) {
        Log-Warning "Spec2cloud agents already exist in this project."
        if ($Merge) {
            Log-Info "Merge mode enabled. Existing files will be preserved."
        } else {
            $response = Read-Host "Overwrite existing installation? (y/N)"
            if ($response -notmatch "^[Yy]$") {
                exit 1
            }
        }
    }
}

function New-DirectoryStructure {
    Log-Info "Creating directory structure..."
    
    $directories = @(
        ".github\agents",
        ".github\prompts",
        "specs\features",
        "specs\tasks",
        "specs\docs"
    )
    
    foreach ($dir in $directories) {
        $fullPath = Join-Path $TargetDir $dir
        if (-not (Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        }
    }
    
    Log-Success "Directory structure created"
}

function Install-AgentsAndPrompts {
    Log-Info "Installing agents and prompts..."
    
    # Copy agents
    $agentsSource = Join-Path $PackageRoot ".github\agents"
    $agentsTarget = Join-Path $TargetDir ".github\agents"
    
    if (Test-Path $agentsSource) {
        Get-ChildItem -Path $agentsSource -Filter "*.agent.md" | ForEach-Object {
            Copy-Item $_.FullName -Destination $agentsTarget -Force
        }
        $agentCount = (Get-ChildItem -Path $agentsTarget -Filter "*.agent.md").Count
        Log-Success "Installed $agentCount agents"
    }
    
    # Copy prompts
    $promptsSource = Join-Path $PackageRoot ".github\prompts"
    $promptsTarget = Join-Path $TargetDir ".github\prompts"
    
    if (Test-Path $promptsSource) {
        Get-ChildItem -Path $promptsSource -Filter "*.prompt.md" | ForEach-Object {
            Copy-Item $_.FullName -Destination $promptsTarget -Force
        }
        $promptCount = (Get-ChildItem -Path $promptsTarget -Filter "*.prompt.md").Count
        Log-Success "Installed $promptCount prompts"
    }
}

function Install-VSCodeConfig {
    Log-Info "Installing VS Code configuration..."
    
    $vscodeDir = Join-Path $TargetDir ".vscode"
    if (-not (Test-Path $vscodeDir)) {
        New-Item -ItemType Directory -Path $vscodeDir -Force | Out-Null
    }
    
    $mcpSource = Join-Path $PackageRoot ".vscode\mcp.json"
    $mcpTarget = Join-Path $TargetDir ".vscode\mcp.json"
    
    if (Test-Path $mcpSource) {
        if ((Test-Path $mcpTarget) -and $Merge) {
            Log-Warning "mcp.json already exists. Manual merge may be required."
            Copy-Item $mcpSource -Destination "$mcpTarget.spec2cloud" -Force
            Log-Info "Saved as mcp.json.spec2cloud for manual review"
        } else {
            Copy-Item $mcpSource -Destination $mcpTarget -Force
            Log-Success "Installed MCP configuration"
        }
    }
}

function Install-DevContainer {
    Log-Info "Installing dev container configuration..."
    
    $devcontainerSource = Join-Path $PackageRoot ".devcontainer\devcontainer.json"
    $devcontainerDir = Join-Path $TargetDir ".devcontainer"
    $devcontainerTarget = Join-Path $devcontainerDir "devcontainer.json"
    
    if (Test-Path $devcontainerSource) {
        if (-not (Test-Path $devcontainerDir)) {
            New-Item -ItemType Directory -Path $devcontainerDir -Force | Out-Null
        }
        
        if ((Test-Path $devcontainerTarget) -and $Merge) {
            Log-Warning "devcontainer.json already exists. Manual merge may be required."
            Copy-Item $devcontainerSource -Destination "$devcontainerTarget.spec2cloud" -Force
            Log-Info "Saved as devcontainer.json.spec2cloud for manual review"
        } else {
            Copy-Item $devcontainerSource -Destination $devcontainerTarget -Force
            Log-Success "Installed dev container configuration"
        }
    }
}

function Install-APMConfig {
    Log-Info "Installing APM configuration..."
    
    $apmSource = Join-Path $PackageRoot "templates\apm.yml.template"
    $apmTarget = Join-Path $TargetDir "apm.yml"
    
    if (Test-Path $apmSource) {
        if ((Test-Path $apmTarget) -and $Merge) {
            Log-Warning "apm.yml already exists. Skipping."
        } else {
            Copy-Item $apmSource -Destination $apmTarget -Force
            Log-Success "Installed apm.yml configuration"
            
            # Try to run apm install if available
            if (Get-Command apm -ErrorAction SilentlyContinue) {
                Log-Info "Running apm install..."
                Push-Location $TargetDir
                try {
                    apm install
                } catch {
                    Log-Warning "apm install failed. Run manually later."
                }
                Pop-Location
            } else {
                Log-Info "APM not found. Install from: https://github.com/danielmeppiel/apm"
            }
        }
    }
}

function New-GitKeepFiles {
    Log-Info "Creating .gitkeep files for empty directories..."
    
    $directories = @(
        "specs",
        "specs\domain",
        "specs\features",
        "specs\tasks",
        "specs\docs"
    )
    
    foreach ($dir in $directories) {
        $gitkeepPath = Join-Path $TargetDir "$dir\.gitkeep"
        if (-not (Test-Path $gitkeepPath)) {
            New-Item -ItemType File -Path $gitkeepPath -Force | Out-Null
        }
    }
    
    Log-Success "Created .gitkeep files"
}

function Write-NextSteps {
    Write-Host ""
    Write-Host "${GREEN}${BOLD}✨ Spec2Cloud installation complete!${NC}"
    Write-Host ""
    Write-Host "${BOLD}Next steps:${NC}"
    Write-Host ""
    Write-Host "1. Open your project in VS Code with GitHub Copilot"
    Write-Host "2. Start using the workflows:"
    Write-Host ""
    Write-Host "   ${BLUE}Greenfield (New Features):${NC}"
    Write-Host "     • /prd      - Create Product Requirements Document"
    Write-Host "     • /frd      - Create Feature Requirements Documents"
    Write-Host "     • /ddd      - Create domain and database model proposals"
    Write-Host "     • /plan     - Create Technical Task Breakdown"
    Write-Host "     • /implement - Implement features locally"
    Write-Host "     • /deploy   - Deploy to Azure"
    Write-Host ""
    Write-Host "   ${BLUE}Brownfield (Existing Code):${NC}"
    Write-Host "     • /rev-eng   - Reverse engineer codebase into specs"
    Write-Host "     • /ddd       - Create bounded contexts and data model diagrams"
    Write-Host "     • /modernize - Create modernization plan"
    Write-Host ""
    Write-Host "3. ${BOLD}Learn more:${NC} https://github.com/EmeaAppGbb/spec2cloud"
    Write-Host ""
    
    $mergeFiles = @()
    if (Test-Path "$TargetDir\.vscode\mcp.json.spec2cloud") {
        $mergeFiles += "  • .vscode\mcp.json.spec2cloud"
    }
    if (Test-Path "$TargetDir\.devcontainer\devcontainer.json.spec2cloud") {
        $mergeFiles += "  • .devcontainer\devcontainer.json.spec2cloud"
    }
    
    if ($mergeFiles.Count -gt 0) {
        Write-Host "${YELLOW}⚠ Manual merge required:${NC}"
        $mergeFiles | ForEach-Object { Write-Host $_ }
        Write-Host ""
    }
}

# Show help
if ($Help) {
    Write-Usage
    exit 0
}

# Determine mode
$Mode = if ($AgentsOnly) { "agents-only" } else { "full" }

# Convert to absolute path
$TargetDir = Resolve-Path $TargetDir -ErrorAction SilentlyContinue
if (-not $TargetDir) {
    $TargetDir = (Get-Location).Path
}

# Main installation flow
Write-Header

Log-Info "Installation mode: $Mode"
Log-Info "Target directory: $TargetDir"
Write-Host ""

# Pre-flight checks
Log-Info "Running pre-flight checks..."
Test-GitRepo
Test-ExistingInstallation
Log-Success "Pre-flight checks passed"
Write-Host ""

# Create structure
New-DirectoryStructure

# Install components
Install-AgentsAndPrompts

if ($Mode -eq "full") {
    Install-VSCodeConfig
    Install-DevContainer
    Install-APMConfig
}

New-GitKeepFiles

# Done
Write-NextSteps
