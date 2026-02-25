# Spec2Cloud Uninstall Script (PowerShell)
# Removes only spec2cloud-installed agents, prompts, and configurations from a project.
# Custom agents/prompts added by the user are preserved.

param(
    [Parameter(Position=0)]
    [string]$TargetDir = ".",

    [switch]$RemoveSpecs,
    [switch]$Force,
    [switch]$NoColor,
    [switch]$Help
)

$VERSION = "1.0.0"
$ErrorActionPreference = "Stop"

# Known spec2cloud agent filenames (installed by install.ps1)
$Spec2CloudAgents = @(
    "architect.agent.md"
    "azure.agent.md"
    "dev.agent.md"
    "devlead.agent.md"
    "extender.agent.md"
    "modernizer.agent.md"
    "planner.agent.md"
    "pm.agent.md"
    "spec2cloud.agent.md"
    "tech-analyst.agent.md"
)

# Known spec2cloud prompt filenames (installed by install.ps1)
$Spec2CloudPrompts = @(
    "adr.prompt.md"
    "bootstrap-agents.prompt.md"
    "delegate.prompt.md"
    "deploy.prompt.md"
    "extend.prompt.md"
    "frd.prompt.md"
    "generate-agents.prompt.md"
    "implement.prompt.md"
    "modernize.prompt.md"
    "plan.prompt.md"
    "prd.prompt.md"
    "rev-eng.prompt.md"
)

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
    Write-Host "║                   Spec2Cloud Uninstaller                  ║"
    Write-Host "║            AI-Powered Development Workflows               ║"
    Write-Host "╚═══════════════════════════════════════════════════════════╝"
    Write-Host "${NC}"
}

function Write-Usage {
    @"
Usage: uninstall.ps1 [OPTIONS] [TARGET_DIR]

Remove spec2cloud from an existing project.

OPTIONS:
  -RemoveSpecs        Also remove specs/ directory (contains generated docs!)
  -Force              Skip confirmation prompts
  -NoColor            Disable colored output
  -Help               Show this help message

TARGET_DIR:
  Directory to uninstall from (default: current directory)

EXAMPLES:
  # Remove agents, prompts, and configs (preserve specs/)
  .\uninstall.ps1

  # Remove everything including generated specs
  .\uninstall.ps1 -RemoveSpecs

  # Force removal without prompts
  .\uninstall.ps1 -Force

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

# Show help
if ($Help) {
    Write-Usage
    exit 0
}

# Convert to absolute path
$resolved = Resolve-Path $TargetDir -ErrorAction SilentlyContinue
if (-not $resolved) {
    Log-Error "Target directory does not exist: $TargetDir"
    exit 1
}
$TargetDir = $resolved.Path

function Test-Installation {
    $agentsExist = Test-Path "$TargetDir\.github\agents"
    $promptsExist = Test-Path "$TargetDir\.github\prompts"

    if (-not $agentsExist -and -not $promptsExist) {
        Log-Error "No spec2cloud installation found in $TargetDir"
        exit 1
    }
}

function Confirm-Removal {
    if ($Force) { return }

    Write-Host ""
    Log-Warning "This will remove the following spec2cloud components from $TargetDir :"
    Write-Host ""

    # Count spec2cloud agent files that exist
    $agentCount = 0
    foreach ($agent in $Spec2CloudAgents) {
        if (Test-Path (Join-Path "$TargetDir\.github\agents" $agent)) {
            $agentCount++
        }
    }
    if ($agentCount -gt 0) {
        Write-Host "  - $agentCount spec2cloud agent(s) from .github\agents\"
    }

    # Count spec2cloud prompt files that exist
    $promptCount = 0
    foreach ($prompt in $Spec2CloudPrompts) {
        if (Test-Path (Join-Path "$TargetDir\.github\prompts" $prompt)) {
            $promptCount++
        }
    }
    if ($promptCount -gt 0) {
        Write-Host "  - $promptCount spec2cloud prompt(s) from .github\prompts\"
    }

    # Detect custom files that will be PRESERVED
    $customAgents = 0
    $customPrompts = 0
    if (Test-Path "$TargetDir\.github\agents") {
        Get-ChildItem "$TargetDir\.github\agents" -Filter "*.agent.md" -ErrorAction SilentlyContinue | ForEach-Object {
            if ($_.Name -notin $Spec2CloudAgents) { $customAgents++ }
        }
    }
    if (Test-Path "$TargetDir\.github\prompts") {
        Get-ChildItem "$TargetDir\.github\prompts" -Filter "*.prompt.md" -ErrorAction SilentlyContinue | ForEach-Object {
            if ($_.Name -notin $Spec2CloudPrompts) { $customPrompts++ }
        }
    }
    if ($customAgents -gt 0 -or $customPrompts -gt 0) {
        Write-Host ""
        Log-Info "Preserving $customAgents custom agent(s) and $customPrompts custom prompt(s)"
    }

    if (Test-Path "$TargetDir\.vscode\mcp.json") {
        Write-Host "  - .vscode\mcp.json (MCP server config)"
    }
    if (Test-Path "$TargetDir\.devcontainer\devcontainer.json") {
        Write-Host "  - .devcontainer\devcontainer.json (dev container config)"
    }
    if (Test-Path "$TargetDir\apm.yml") {
        Write-Host "  - apm.yml (APM configuration)"
    }

    $backups = Get-ChildItem -Path $TargetDir -Filter "*.spec2cloud" -Recurse -ErrorAction SilentlyContinue
    if ($backups) {
        Write-Host "  - *.spec2cloud backup files ($($backups.Count) files)"
    }

    if ($RemoveSpecs) {
        Write-Host ""
        Log-Warning "Also removing specs\ directory (generated documentation)!"
        Write-Host "  - specs\ (PRDs, FRDs, tasks, docs)"
    }

    Write-Host ""
    $response = Read-Host "Continue? (y/N)"
    if ($response -notmatch "^[Yy]$") {
        Log-Info "Uninstall cancelled."
        exit 0
    }
}

function Remove-AgentsAndPrompts {
    # Remove only known spec2cloud agents
    $removed = 0
    foreach ($agent in $Spec2CloudAgents) {
        $path = Join-Path "$TargetDir\.github\agents" $agent
        if (Test-Path $path) {
            Remove-Item $path -Force
            $removed++
        }
    }
    if ($removed -gt 0) {
        Log-Success "Removed $removed spec2cloud agent(s)"
    }

    # Remove only known spec2cloud prompts
    $removed = 0
    foreach ($prompt in $Spec2CloudPrompts) {
        $path = Join-Path "$TargetDir\.github\prompts" $prompt
        if (Test-Path $path) {
            Remove-Item $path -Force
            $removed++
        }
    }
    if ($removed -gt 0) {
        Log-Success "Removed $removed spec2cloud prompt(s)"
    }

    # Clean up empty directories (only if nothing custom remains)
    foreach ($dir in @(".github\prompts", ".github\agents", ".github")) {
        $fullPath = Join-Path $TargetDir $dir
        if ((Test-Path $fullPath) -and (Get-ChildItem $fullPath | Measure-Object).Count -eq 0) {
            Remove-Item $fullPath -Force
            Log-Success "Removed empty $dir\"
        }
    }
}

function Remove-Configs {
    # MCP config
    if (Test-Path "$TargetDir\.vscode\mcp.json") {
        Remove-Item "$TargetDir\.vscode\mcp.json" -Force
        Log-Success "Removed .vscode\mcp.json"
    }

    # Dev container
    if (Test-Path "$TargetDir\.devcontainer\devcontainer.json") {
        Remove-Item "$TargetDir\.devcontainer\devcontainer.json" -Force
        Log-Success "Removed .devcontainer\devcontainer.json"
    }

    # APM config
    if (Test-Path "$TargetDir\apm.yml") {
        Remove-Item "$TargetDir\apm.yml" -Force
        Log-Success "Removed apm.yml"
    }

    # AGENTS.md (auto-generated by apm compile)
    if (Test-Path "$TargetDir\AGENTS.md") {
        Remove-Item "$TargetDir\AGENTS.md" -Force
        Log-Success "Removed AGENTS.md"
    }

    # Remove .spec2cloud backup files
    $backups = Get-ChildItem -Path $TargetDir -Filter "*.spec2cloud" -Recurse -ErrorAction SilentlyContinue
    if ($backups) {
        $backups | Remove-Item -Force
        Log-Success "Removed $($backups.Count) .spec2cloud backup files"
    }

    # Clean up empty directories
    foreach ($dir in @(".vscode", ".devcontainer")) {
        $fullPath = Join-Path $TargetDir $dir
        if ((Test-Path $fullPath) -and (Get-ChildItem $fullPath | Measure-Object).Count -eq 0) {
            Remove-Item $fullPath -Force
            Log-Success "Removed empty $dir\"
        }
    }
}

function Remove-Specs {
    if ($RemoveSpecs -and (Test-Path "$TargetDir\specs")) {
        Remove-Item "$TargetDir\specs" -Recurse -Force
        Log-Success "Removed specs\"
    }
}

# Main uninstall flow
Write-Header

Log-Info "Target directory: $TargetDir"
Write-Host ""

Test-Installation
Confirm-Removal

Write-Host ""
Log-Info "Removing spec2cloud components..."
Write-Host ""

Remove-AgentsAndPrompts
Remove-Configs
Remove-Specs

Write-Host ""
Log-Success "Spec2Cloud has been uninstalled from $TargetDir"
Write-Host ""

# Check if specs were preserved
if (-not $RemoveSpecs -and (Test-Path "$TargetDir\specs")) {
    Log-Info "specs\ directory was preserved. Remove manually if not needed:"
    Write-Host "  Remove-Item -Recurse -Force $TargetDir\specs"
}
