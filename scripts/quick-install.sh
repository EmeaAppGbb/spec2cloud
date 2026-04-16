#!/bin/bash

# Spec2Cloud Quick Install Script
# One-liner installation from GitHub branches or tags

set -e

REPO="EmeaAppGbb/spec2cloud"
REF="vNext"
MODE="full"
TARGET_DIR="."

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

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

print_header() {
  echo -e "${BLUE}${BOLD}"
  echo "╔═══════════════════════════════════════════════════════════╗"
  echo "║              Spec2Cloud Quick Installer                   ║"
  echo "╚═══════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
}

check_dependencies() {
  local missing=()
  
  for cmd in curl tar; do
    if ! command -v $cmd &> /dev/null; then
      missing+=($cmd)
    fi
  done
  
  if [ ${#missing[@]} -gt 0 ]; then
    log_error "Missing required dependencies: ${missing[*]}"
    echo
    echo "Please install missing dependencies:"
    echo "  Ubuntu/Debian: sudo apt-get install ${missing[*]}"
    echo "  macOS:         brew install ${missing[*]}"
    exit 1
  fi
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --minimal)
        MODE="minimal"
        shift
        ;;
      --ref|--branch|--tag|--version)
        REF="$2"
        shift 2
        ;;
      --target)
        TARGET_DIR="$2"
        shift 2
        ;;
      --help)
        cat << EOF
Spec2Cloud Quick Install Script

Usage: curl -fsSL https://raw.githubusercontent.com/${REPO}/vNext/scripts/quick-install.sh | bash -s -- [OPTIONS]

OPTIONS:
  --minimal           Install minimal package (skills only)
  --ref REF           Branch or tag to install from (default: vNext)
  --branch BRANCH     Alias for --ref
  --tag TAG           Alias for --ref
  --target DIR        Install to specific directory (default: current)
  --help              Show this help message

EXAMPLES:
  # Default installation (full package from vNext branch)
  curl -fsSL https://raw.githubusercontent.com/${REPO}/vNext/scripts/quick-install.sh | bash

  # Minimal installation
  curl -fsSL https://raw.githubusercontent.com/${REPO}/vNext/scripts/quick-install.sh | bash -s -- --minimal

  # Install from a specific branch
  curl -fsSL https://raw.githubusercontent.com/${REPO}/vNext/scripts/quick-install.sh | bash -s -- --ref feature/new-skills

  # Install from a specific tag
  curl -fsSL https://raw.githubusercontent.com/${REPO}/vNext/scripts/quick-install.sh | bash -s -- --tag v2.0.0

  # Custom directory
  curl -fsSL https://raw.githubusercontent.com/${REPO}/vNext/scripts/quick-install.sh | bash -s -- --target /path/to/project

EOF
        exit 0
        ;;
      *)
        log_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
    esac
  done
}

download_and_install() {
  local archive_url="https://github.com/${REPO}/archive/${REF}.tar.gz"
  local temp_dir=$(mktemp -d)
  local archive_file="${temp_dir}/spec2cloud.tar.gz"
  
  log_info "Downloading spec2cloud from ref: $REF ..."
  
  if ! curl -fsSL "$archive_url" -o "$archive_file"; then
    log_error "Failed to download from: $archive_url"
    log_info "Check that branch or tag '${REF}' exists at: https://github.com/${REPO}"
    rm -rf "$temp_dir"
    exit 1
  fi
  
  log_success "Downloaded successfully"
  
  log_info "Extracting archive..."
  tar -xzf "$archive_file" -C "$temp_dir"
  log_success "Extracted successfully"
  
  # Find the extracted directory (GitHub names it {repo}-{ref})
  local extracted_dir
  extracted_dir=$(find "$temp_dir" -mindepth 1 -maxdepth 1 -type d | head -1)
  
  if [ -z "$extracted_dir" ]; then
    log_error "Failed to find extracted directory"
    rm -rf "$temp_dir"
    exit 1
  fi
  
  log_info "Installing to: $TARGET_DIR"
  
  # Copy only relevant spec2cloud files (not repo workflows, docs, etc.)
  log_info "Copying files..."
  
  # Always install: skills, AGENTS.md, skills-lock.json, .spec2cloud
  if [ -d "$extracted_dir/.github/skills" ]; then
    mkdir -p "$TARGET_DIR/.github/skills"
    cp -r "$extracted_dir/.github/skills/"* "$TARGET_DIR/.github/skills/"
  else
    log_error "Archive is missing .github/skills — not a valid spec2cloud archive"
    rm -rf "$temp_dir"
    exit 1
  fi
  
  if [ -f "$extracted_dir/AGENTS.md" ]; then
    cp "$extracted_dir/AGENTS.md" "$TARGET_DIR/"
  fi
  
  if [ -f "$extracted_dir/skills-lock.json" ]; then
    cp "$extracted_dir/skills-lock.json" "$TARGET_DIR/"
  fi
  
  if [ -d "$extracted_dir/.spec2cloud" ]; then
    mkdir -p "$TARGET_DIR/.spec2cloud"
    cp -r "$extracted_dir/.spec2cloud/"* "$TARGET_DIR/.spec2cloud/"
  fi
  
  # Full mode: also install devcontainer, MCP config, copilot instructions
  if [ "$MODE" = "full" ]; then
    if [ -f "$extracted_dir/.github/copilot-instructions.md" ]; then
      mkdir -p "$TARGET_DIR/.github"
      cp "$extracted_dir/.github/copilot-instructions.md" "$TARGET_DIR/.github/"
    fi
    
    if [ -f "$extracted_dir/.github/lsp.json" ]; then
      mkdir -p "$TARGET_DIR/.github"
      cp "$extracted_dir/.github/lsp.json" "$TARGET_DIR/.github/"
    fi
    
    if [ -f "$extracted_dir/.mcp.json" ]; then
      cp "$extracted_dir/.mcp.json" "$TARGET_DIR/"
    fi
    
    if [ -f "$extracted_dir/.vscode/mcp.json" ]; then
      mkdir -p "$TARGET_DIR/.vscode"
      cp "$extracted_dir/.vscode/mcp.json" "$TARGET_DIR/.vscode/"
    fi
    
    if [ -f "$extracted_dir/.devcontainer/devcontainer.json" ]; then
      mkdir -p "$TARGET_DIR/.devcontainer"
      cp "$extracted_dir/.devcontainer/devcontainer.json" "$TARGET_DIR/.devcontainer/"
    fi
  fi
  
  # Create specs directory structure
  mkdir -p "$TARGET_DIR/specs/features"
  mkdir -p "$TARGET_DIR/specs/tasks"
  mkdir -p "$TARGET_DIR/specs/docs"
  mkdir -p "$TARGET_DIR/specs/domain"
  
  log_success "Installation complete"
  
  # Cleanup
  rm -rf "$temp_dir"
}

# Main execution
parse_args "$@"

print_header

log_info "Mode: $MODE"
log_info "Ref: $REF"
log_info "Target: $TARGET_DIR"
echo

check_dependencies

download_and_install

echo
log_success "Spec2Cloud installation complete!"
echo
echo "Next steps:"
echo "1. Open your project in VS Code with GitHub Copilot"
echo "2. The spec2cloud orchestrator and 46 skills are now active"
echo "3. Start a conversation with Copilot to begin your workflow"
echo "4. Learn more: https://github.com/${REPO}"
echo
