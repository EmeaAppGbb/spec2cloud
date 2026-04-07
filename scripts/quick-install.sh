#!/bin/bash

# Spec2Cloud Quick Install Script
# One-liner installation from GitHub releases

set -e

REPO="EmeaAppGbb/spec2cloud"
VERSION="latest"
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
  
  for cmd in curl unzip; do
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
      --version)
        VERSION="$2"
        shift 2
        ;;
      --target)
        TARGET_DIR="$2"
        shift 2
        ;;
      --help)
        cat << EOF
Spec2Cloud Quick Install Script

Usage: curl -fsSL https://raw.githubusercontent.com/EmeaAppGbb/spec2cloud/main/scripts/quick-install.sh | bash -s -- [OPTIONS]

OPTIONS:
  --minimal           Install minimal package (agents and prompts only)
  --version VERSION   Install specific version (default: latest)
  --target DIR        Install to specific directory (default: current)
  --help              Show this help message

EXAMPLES:
  # Default installation (full package, latest version)
  curl -fsSL https://raw.githubusercontent.com/EmeaAppGbb/spec2cloud/main/scripts/quick-install.sh | bash

  # Minimal installation
  curl -fsSL https://raw.githubusercontent.com/EmeaAppGbb/spec2cloud/main/scripts/quick-install.sh | bash -s -- --minimal

  # Specific version
  curl -fsSL https://raw.githubusercontent.com/EmeaAppGbb/spec2cloud/main/scripts/quick-install.sh | bash -s -- --version v1.0.0

  # Custom directory
  curl -fsSL https://raw.githubusercontent.com/EmeaAppGbb/spec2cloud/main/scripts/quick-install.sh | bash -s -- --target /path/to/project

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

get_download_url() {
  local package_name="spec2cloud-${MODE}"
  
  if [ "$VERSION" = "latest" ]; then
    echo "https://github.com/${REPO}/releases/latest/download/${package_name}-latest.zip"
  else
    echo "https://github.com/${REPO}/releases/download/${VERSION}/${package_name}-${VERSION}.zip"
  fi
}

download_and_install() {
  local download_url=$(get_download_url)
  local temp_dir=$(mktemp -d)
  local zip_file="${temp_dir}/spec2cloud.zip"
  
  log_info "Downloading spec2cloud $MODE package ($VERSION)..."
  
  if ! curl -fsSL "$download_url" -o "$zip_file"; then
    log_error "Failed to download from: $download_url"
    log_info "This might be because the release doesn't exist yet."
    log_info "Check available releases at: https://github.com/${REPO}/releases"
    rm -rf "$temp_dir"
    exit 1
  fi
  
  log_success "Downloaded successfully"
  
  log_info "Extracting package..."
  unzip -q "$zip_file" -d "$temp_dir/spec2cloud"
  log_success "Extracted successfully"
  
  log_info "Installing to: $TARGET_DIR"
  
  if [ -f "$temp_dir/spec2cloud/scripts/install.sh" ]; then
    # Run the installer from the package
    chmod +x "$temp_dir/spec2cloud/scripts/install.sh"
    
    if [ "$MODE" = "minimal" ]; then
      "$temp_dir/spec2cloud/scripts/install.sh" --agents-only "$TARGET_DIR"
    else
      "$temp_dir/spec2cloud/scripts/install.sh" --full "$TARGET_DIR"
    fi
  else
    # Fallback: manual copy for minimal package
    log_info "Copying files..."
    
    if [ -d "$temp_dir/spec2cloud/.github" ]; then
      mkdir -p "$TARGET_DIR/.github"
      cp -r "$temp_dir/spec2cloud/.github/"* "$TARGET_DIR/.github/"
      log_success "Installation complete"
    else
      log_error "Package structure is invalid"
      rm -rf "$temp_dir"
      exit 1
    fi
  fi
  
  # Cleanup
  rm -rf "$temp_dir"
}

# Main execution
parse_args "$@"

print_header

log_info "Mode: $MODE"
log_info "Version: $VERSION"
log_info "Target: $TARGET_DIR"
echo

check_dependencies

download_and_install

echo
log_success "Spec2Cloud installation complete!"
echo
echo "Next steps:"
echo "1. Open your project in VS Code with GitHub Copilot"
echo "2. Use workflows like /prd, /frd, /ddd, /plan, /implement, /deploy"
echo "3. Learn more: https://github.com/${REPO}"
echo
