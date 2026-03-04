#!/bin/bash

# Spec2Cloud Uninstall Script
# Removes only spec2cloud-installed agents, prompts, and configurations from a project
# Custom agents/prompts added by the user are preserved.

set -e

VERSION="1.0.0"
COLORS=true

# Known spec2cloud agent filenames (installed by install.sh)
SPEC2CLOUD_AGENTS=(
  architect.agent.md
  azure.agent.md
  dev.agent.md
  devlead.agent.md
  extender.agent.md
  modernizer.agent.md
  planner.agent.md
  pm.agent.md
  spec2cloud.agent.md
  tech-analyst.agent.md
)

# Known spec2cloud prompt filenames (installed by install.sh)
SPEC2CLOUD_PROMPTS=(
  adr.prompt.md
  bootstrap-agents.prompt.md
  delegate.prompt.md
  deploy.prompt.md
  extend.prompt.md
  frd.prompt.md
  generate-agents.prompt.md
  implement.prompt.md
  modernize.prompt.md
  plan.prompt.md
  prd.prompt.md
  rev-eng.prompt.md
)

# Color codes
if [ "$COLORS" = true ]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  BLUE='\033[0;34m'
  BOLD='\033[1m'
  NC='\033[0m'
else
  RED=''
  GREEN=''
  YELLOW=''
  BLUE=''
  BOLD=''
  NC=''
fi

# Default options
REMOVE_SPECS=false
FORCE=false
TARGET_DIR="."

print_header() {
  echo -e "${BLUE}${BOLD}"
  echo "╔═══════════════════════════════════════════════════════════╗"
  echo "║                   Spec2Cloud Uninstaller                  ║"
  echo "║            AI-Powered Development Workflows               ║"
  echo "╚═══════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
}

print_usage() {
  cat << EOF
Usage: $0 [OPTIONS] [TARGET_DIR]

Remove spec2cloud from an existing project.

OPTIONS:
  --remove-specs      Also remove specs/ directory (contains generated docs!)
  --force             Skip confirmation prompts
  --no-color          Disable colored output
  --help              Show this help message

TARGET_DIR:
  Directory to uninstall from (default: current directory)

EXAMPLES:
  # Remove agents, prompts, and configs (preserve specs/)
  $0

  # Remove everything including generated specs
  $0 --remove-specs

  # Force removal without prompts
  $0 --force

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

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --remove-specs) REMOVE_SPECS=true; shift ;;
    --force) FORCE=true; shift ;;
    --no-color) COLORS=false; RED=''; GREEN=''; YELLOW=''; BLUE=''; BOLD=''; NC=''; shift ;;
    --help) print_usage; exit 0 ;;
    *) TARGET_DIR="$1"; shift ;;
  esac
done

# Resolve target directory
TARGET_DIR="$(cd "$TARGET_DIR" 2>/dev/null && pwd)" || {
  log_error "Target directory does not exist: $TARGET_DIR"
  exit 1
}

# Verify spec2cloud is installed
check_installation() {
  if [ ! -d "$TARGET_DIR/.github/agents" ] && [ ! -d "$TARGET_DIR/.github/prompts" ]; then
    log_error "No spec2cloud installation found in $TARGET_DIR"
    exit 1
  fi
}

# Confirm with user
confirm_removal() {
  if [ "$FORCE" = true ]; then
    return
  fi

  echo ""
  log_warning "This will remove the following spec2cloud components from $TARGET_DIR:"
  echo ""

  # List specific agent files that exist
  local agent_count=0
  for agent in "${SPEC2CLOUD_AGENTS[@]}"; do
    if [ -f "$TARGET_DIR/.github/agents/$agent" ]; then
      agent_count=$((agent_count + 1))
    fi
  done
  if [ "$agent_count" -gt 0 ]; then
    echo "  - $agent_count spec2cloud agent(s) from .github/agents/"
  fi

  # List specific prompt files that exist
  local prompt_count=0
  for prompt in "${SPEC2CLOUD_PROMPTS[@]}"; do
    if [ -f "$TARGET_DIR/.github/prompts/$prompt" ]; then
      prompt_count=$((prompt_count + 1))
    fi
  done
  if [ "$prompt_count" -gt 0 ]; then
    echo "  - $prompt_count spec2cloud prompt(s) from .github/prompts/"
  fi

  # Show custom files that will be PRESERVED
  local custom_agents=0
  if [ -d "$TARGET_DIR/.github/agents" ]; then
    for f in "$TARGET_DIR/.github/agents/"*.agent.md; do
      [ -f "$f" ] || continue
      local base
      base=$(basename "$f")
      local is_spec2cloud=false
      for known in "${SPEC2CLOUD_AGENTS[@]}"; do
        if [ "$base" = "$known" ]; then
          is_spec2cloud=true
          break
        fi
      done
      if [ "$is_spec2cloud" = false ]; then
        custom_agents=$((custom_agents + 1))
      fi
    done
  fi

  local custom_prompts=0
  if [ -d "$TARGET_DIR/.github/prompts" ]; then
    for f in "$TARGET_DIR/.github/prompts/"*.prompt.md; do
      [ -f "$f" ] || continue
      local base
      base=$(basename "$f")
      local is_spec2cloud=false
      for known in "${SPEC2CLOUD_PROMPTS[@]}"; do
        if [ "$base" = "$known" ]; then
          is_spec2cloud=true
          break
        fi
      done
      if [ "$is_spec2cloud" = false ]; then
        custom_prompts=$((custom_prompts + 1))
      fi
    done
  fi

  if [ "$custom_agents" -gt 0 ] || [ "$custom_prompts" -gt 0 ]; then
    echo ""
    log_info "Preserving $custom_agents custom agent(s) and $custom_prompts custom prompt(s)"
  fi

  [ -f "$TARGET_DIR/.vscode/mcp.json" ] && echo "  - .vscode/mcp.json (MCP server config)"
  [ -f "$TARGET_DIR/.devcontainer/devcontainer.json" ] && echo "  - .devcontainer/devcontainer.json (dev container config)"
  [ -f "$TARGET_DIR/apm.yml" ] && echo "  - apm.yml (APM configuration)"

  # Show .spec2cloud backup files
  spec2cloud_backups=$(find "$TARGET_DIR" -name "*.spec2cloud" 2>/dev/null || true)
  if [ -n "$spec2cloud_backups" ]; then
    echo "  - *.spec2cloud backup files"
  fi

  if [ "$REMOVE_SPECS" = true ]; then
    echo ""
    log_warning "Also removing specs/ directory (generated documentation)!"
    echo "  - specs/ (PRDs, FRDs, tasks, docs)"
  fi

  echo ""
  read -p "Continue? (y/N) " response
  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    log_info "Uninstall cancelled."
    exit 0
  fi
}

# Remove only spec2cloud agents and prompts (preserves custom files)
remove_agents_and_prompts() {
  local removed=0

  # Remove only known spec2cloud agents
  for agent in "${SPEC2CLOUD_AGENTS[@]}"; do
    if [ -f "$TARGET_DIR/.github/agents/$agent" ]; then
      rm "$TARGET_DIR/.github/agents/$agent"
      removed=$((removed + 1))
    fi
  done
  if [ "$removed" -gt 0 ]; then
    log_success "Removed $removed spec2cloud agent(s)"
  fi

  # Remove only known spec2cloud prompts
  removed=0
  for prompt in "${SPEC2CLOUD_PROMPTS[@]}"; do
    if [ -f "$TARGET_DIR/.github/prompts/$prompt" ]; then
      rm "$TARGET_DIR/.github/prompts/$prompt"
      removed=$((removed + 1))
    fi
  done
  if [ "$removed" -gt 0 ]; then
    log_success "Removed $removed spec2cloud prompt(s)"
  fi

  # Clean up empty directories (only if nothing custom remains)
  for dir in ".github/prompts" ".github/agents" ".github"; do
    if [ -d "$TARGET_DIR/$dir" ] && [ -z "$(ls -A "$TARGET_DIR/$dir" 2>/dev/null)" ]; then
      rmdir "$TARGET_DIR/$dir"
      log_success "Removed empty $dir/"
    fi
  done
}

# Remove configuration files
remove_configs() {
  # MCP config
  if [ -f "$TARGET_DIR/.vscode/mcp.json" ]; then
    rm "$TARGET_DIR/.vscode/mcp.json"
    log_success "Removed .vscode/mcp.json"
  fi

  # Dev container
  if [ -f "$TARGET_DIR/.devcontainer/devcontainer.json" ]; then
    rm "$TARGET_DIR/.devcontainer/devcontainer.json"
    log_success "Removed .devcontainer/devcontainer.json"
  fi

  # APM config
  if [ -f "$TARGET_DIR/apm.yml" ]; then
    rm "$TARGET_DIR/apm.yml"
    log_success "Removed apm.yml"
  fi

  # AGENTS.md (auto-generated by apm compile)
  if [ -f "$TARGET_DIR/AGENTS.md" ]; then
    rm "$TARGET_DIR/AGENTS.md"
    log_success "Removed AGENTS.md"
  fi

  # Remove .spec2cloud backup files
  local backup_count=0
  while IFS= read -r -d '' backup; do
    rm "$backup"
    backup_count=$((backup_count + 1))
  done < <(find "$TARGET_DIR" -name "*.spec2cloud" -print0 2>/dev/null)

  if [ "$backup_count" -gt 0 ]; then
    log_success "Removed $backup_count .spec2cloud backup files"
  fi

  # Clean up empty directories
  for dir in ".vscode" ".devcontainer"; do
    if [ -d "$TARGET_DIR/$dir" ] && [ -z "$(ls -A "$TARGET_DIR/$dir" 2>/dev/null)" ]; then
      rmdir "$TARGET_DIR/$dir"
      log_success "Removed empty $dir/"
    fi
  done
}

# Remove specs directory
remove_specs() {
  if [ "$REMOVE_SPECS" = true ] && [ -d "$TARGET_DIR/specs" ]; then
    rm -rf "$TARGET_DIR/specs"
    log_success "Removed specs/"
  fi
}

# Main uninstall flow
print_header

log_info "Target directory: $TARGET_DIR"
echo ""

check_installation
confirm_removal

echo ""
log_info "Removing spec2cloud components..."
echo ""

remove_agents_and_prompts
remove_configs
remove_specs

echo ""
log_success "Spec2Cloud has been uninstalled from $TARGET_DIR"
echo ""

# Check if specs were preserved
if [ "$REMOVE_SPECS" = false ] && [ -d "$TARGET_DIR/specs" ]; then
  log_info "specs/ directory was preserved. Remove manually if not needed:"
  echo "  rm -rf $TARGET_DIR/specs"
fi
