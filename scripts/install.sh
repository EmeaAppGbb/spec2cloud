#!/bin/bash

# Spec2Cloud Installation Script
# Installs spec2cloud agents, prompts, and configurations into existing projects

set -e

VERSION="1.0.0"
COLORS=true

# Color codes
if [ "$COLORS" = true ]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  BLUE='\033[0;34m'
  BOLD='\033[1m'
  NC='\033[0m' # No Color
else
  RED=''
  GREEN=''
  YELLOW=''
  BLUE=''
  BOLD=''
  NC=''
fi

# Default options
MODE="full"
FORCE=false
MERGE=true
TARGET_DIR="."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_ROOT="$(dirname "$SCRIPT_DIR")"

print_header() {
  echo -e "${BLUE}${BOLD}"
  echo "╔═══════════════════════════════════════════════════════════╗"
  echo "║                    Spec2Cloud Installer                   ║"
  echo "║            AI-Powered Development Workflows               ║"
  echo "╚═══════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
}

print_usage() {
  cat << EOF
Usage: $0 [OPTIONS] [TARGET_DIR]

Install spec2cloud into an existing project.

OPTIONS:
  --full              Install everything (agents, prompts, devcontainer, MCP)
  --agents-only       Install only agents and prompts (minimal)
  --merge             Merge with existing configurations (default)
  --force             Overwrite existing files without prompting
  --no-color          Disable colored output
  --help              Show this help message

TARGET_DIR:
  Directory to install into (default: current directory)

EXAMPLES:
  # Full installation in current directory
  $0 --full

  # Install only agents and prompts
  $0 --agents-only

  # Install into specific project
  $0 --full /path/to/my-project

  # Force overwrite existing installation
  $0 --full --force

EOF
}

log_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

check_git_repo() {
  if [ ! -d "$TARGET_DIR/.git" ]; then
    log_warning "Not a git repository. Spec2cloud works best with git."
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi
}

check_existing_installation() {
  if [ -d "$TARGET_DIR/.github/agents" ] && [ "$FORCE" = false ]; then
    log_warning "Spec2cloud agents already exist in this project."
    if [ "$MERGE" = true ]; then
      log_info "Merge mode enabled. Existing files will be preserved."
    else
      read -p "Overwrite existing installation? (y/N) " -n 1 -r
      echo
      if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
      fi
    fi
  fi
}

create_directory_structure() {
  log_info "Creating directory structure..."
  
  mkdir -p "$TARGET_DIR/.github/agents"
  mkdir -p "$TARGET_DIR/.github/prompts"
  mkdir -p "$TARGET_DIR/specs/features"
  mkdir -p "$TARGET_DIR/specs/tasks"
  mkdir -p "$TARGET_DIR/specs/docs"
  
  log_success "Directory structure created"
}

install_agents_and_prompts() {
  log_info "Installing agents and prompts..."
  
  # Copy agents
  if [ -d "$PACKAGE_ROOT/.github/agents" ]; then
    cp -r "$PACKAGE_ROOT/.github/agents/"*.agent.md "$TARGET_DIR/.github/agents/" 2>/dev/null || true
    agent_count=$(find "$TARGET_DIR/.github/agents" -name "*.agent.md" | wc -l)
    log_success "Installed $agent_count agents"
  fi
  
  # Copy prompts
  if [ -d "$PACKAGE_ROOT/.github/prompts" ]; then
    cp -r "$PACKAGE_ROOT/.github/prompts/"*.prompt.md "$TARGET_DIR/.github/prompts/" 2>/dev/null || true
    prompt_count=$(find "$TARGET_DIR/.github/prompts" -name "*.prompt.md" | wc -l)
    log_success "Installed $prompt_count prompts"
  fi
}

install_vscode_config() {
  log_info "Installing VS Code configuration..."
  
  mkdir -p "$TARGET_DIR/.vscode"
  
  if [ -f "$PACKAGE_ROOT/.vscode/mcp.json" ]; then
    if [ -f "$TARGET_DIR/.vscode/mcp.json" ] && [ "$MERGE" = true ]; then
      log_warning "mcp.json already exists. Manual merge may be required."
      cp "$PACKAGE_ROOT/.vscode/mcp.json" "$TARGET_DIR/.vscode/mcp.json.spec2cloud"
      log_info "Saved as mcp.json.spec2cloud for manual review"
    else
      cp "$PACKAGE_ROOT/.vscode/mcp.json" "$TARGET_DIR/.vscode/mcp.json"
      log_success "Installed MCP configuration"
    fi
  fi
}

install_devcontainer() {
  log_info "Installing dev container configuration..."
  
  if [ -f "$PACKAGE_ROOT/.devcontainer/devcontainer.json" ]; then
    mkdir -p "$TARGET_DIR/.devcontainer"
    
    if [ -f "$TARGET_DIR/.devcontainer/devcontainer.json" ] && [ "$MERGE" = true ]; then
      log_warning "devcontainer.json already exists. Manual merge may be required."
      cp "$PACKAGE_ROOT/.devcontainer/devcontainer.json" "$TARGET_DIR/.devcontainer/devcontainer.json.spec2cloud"
      log_info "Saved as devcontainer.json.spec2cloud for manual review"
    else
      cp "$PACKAGE_ROOT/.devcontainer/devcontainer.json" "$TARGET_DIR/.devcontainer/devcontainer.json"
      log_success "Installed dev container configuration"
    fi
  fi
}

install_apm_config() {
  log_info "Installing APM configuration..."
  
  if [ -f "$PACKAGE_ROOT/templates/apm.yml.template" ]; then
    if [ -f "$TARGET_DIR/apm.yml" ] && [ "$MERGE" = true ]; then
      log_warning "apm.yml already exists. Skipping."
    else
      cp "$PACKAGE_ROOT/templates/apm.yml.template" "$TARGET_DIR/apm.yml"
      log_success "Installed apm.yml configuration"
      
      # Try to run apm install if available
      if command -v apm &> /dev/null; then
        log_info "Running apm install..."
        (cd "$TARGET_DIR" && apm install) || log_warning "apm install failed. Run manually later."
      else
        log_info "APM not found. Install from: https://github.com/danielmeppiel/apm"
      fi
    fi
  fi
}

create_gitkeep_files() {
  log_info "Creating .gitkeep files for empty directories..."

  mkdir -p "$TARGET_DIR/specs"
  mkdir -p "$TARGET_DIR/specs/domain"
  mkdir -p "$TARGET_DIR/specs/features"
  mkdir -p "$TARGET_DIR/specs/tasks"
  mkdir -p "$TARGET_DIR/specs/docs"

  touch "$TARGET_DIR/specs/.gitkeep"
  touch "$TARGET_DIR/specs/domain/.gitkeep"
  touch "$TARGET_DIR/specs/features/.gitkeep"
  touch "$TARGET_DIR/specs/tasks/.gitkeep"
  touch "$TARGET_DIR/specs/docs/.gitkeep"
  
  log_success "Created .gitkeep files"
}

print_next_steps() {
  echo
  echo -e "${GREEN}${BOLD}✨ Spec2Cloud installation complete!${NC}"
  echo
  echo -e "${BOLD}Next steps:${NC}"
  echo
  echo "1. Open your project in VS Code with GitHub Copilot"
  echo "2. Start using the workflows:"
  echo
  echo -e "   ${BLUE}Greenfield (New Features):${NC}"
  echo "     • /prd      - Create Product Requirements Document"
  echo "     • /frd      - Create Feature Requirements Documents"
  echo "     • /ddd      - Create domain and database model proposals"
  echo "     • /plan     - Create Technical Task Breakdown"
  echo "     • /implement - Implement features locally"
  echo "     • /deploy   - Deploy to Azure"
  echo
  echo -e "   ${BLUE}Brownfield (Existing Code):${NC}"
  echo "     • /rev-eng   - Reverse engineer codebase into specs"
  echo "     • /ddd       - Create bounded contexts and data model diagrams"
  echo "     • /modernize - Create modernization plan"
  echo
  echo -e "3. ${BOLD}Learn more:${NC} https://github.com/EmeaAppGbb/spec2cloud"
  echo
  
  if [ -f "$TARGET_DIR/.vscode/mcp.json.spec2cloud" ] || [ -f "$TARGET_DIR/.devcontainer/devcontainer.json.spec2cloud" ]; then
    echo -e "${YELLOW}⚠ Manual merge required:${NC}"
    [ -f "$TARGET_DIR/.vscode/mcp.json.spec2cloud" ] && echo "  • .vscode/mcp.json.spec2cloud"
    [ -f "$TARGET_DIR/.devcontainer/devcontainer.json.spec2cloud" ] && echo "  • .devcontainer/devcontainer.json.spec2cloud"
    echo
  fi
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --full)
      MODE="full"
      shift
      ;;
    --agents-only)
      MODE="agents-only"
      shift
      ;;
    --merge)
      MERGE=true
      shift
      ;;
    --force)
      FORCE=true
      MERGE=false
      shift
      ;;
    --no-color)
      COLORS=false
      RED=''
      GREEN=''
      YELLOW=''
      BLUE=''
      BOLD=''
      NC=''
      shift
      ;;
    --help)
      print_usage
      exit 0
      ;;
    *)
      TARGET_DIR="$1"
      shift
      ;;
  esac
done

# Convert to absolute path
TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"

# Main installation flow
print_header

log_info "Installation mode: $MODE"
log_info "Target directory: $TARGET_DIR"
echo

# Pre-flight checks
log_info "Running pre-flight checks..."
check_git_repo
check_existing_installation
log_success "Pre-flight checks passed"
echo

# Create structure
create_directory_structure

# Install components
install_agents_and_prompts

if [ "$MODE" = "full" ]; then
  install_vscode_config
  install_devcontainer
  install_apm_config
fi

create_gitkeep_files

# Done
print_next_steps
