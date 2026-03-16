#!/bin/bash
# Reads .vscode/mcp.json and configures Copilot CLI with the MCP servers.
# Merges into ~/.copilot/mcp-config.json, preserving any existing entries.
set -e

VSCODE_MCP=".vscode/mcp.json"
COPILOT_CONFIG_DIR="$HOME/.copilot"
COPILOT_MCP="$COPILOT_CONFIG_DIR/mcp-config.json"

if [ ! -f "$VSCODE_MCP" ]; then
  echo "No .vscode/mcp.json found — skipping MCP setup."
  exit 0
fi

mkdir -p "$COPILOT_CONFIG_DIR"

# Start from existing config or empty object
if [ -f "$COPILOT_MCP" ]; then
  existing=$(cat "$COPILOT_MCP")
else
  existing='{"mcpServers":{}}'
fi

# Transform .vscode/mcp.json servers into Copilot CLI format and merge
updated=$(node -e "
const fs = require('fs');
const vscode = JSON.parse(fs.readFileSync('$VSCODE_MCP', 'utf8'));
const existing = JSON.parse(process.argv[1]);

if (!existing.mcpServers) existing.mcpServers = {};

for (const [rawName, server] of Object.entries(vscode.servers || {})) {
  // Skip github — already built into Copilot CLI
  if (rawName === 'github') continue;
  // Normalize dots to hyphens for CLI compatibility
  const name = rawName.replace(/\./g, '-');
  // Skip if already configured
  if (existing.mcpServers[name]) continue;

  if (server.type === 'http' && server.url) {
    existing.mcpServers[name] = { type: 'http', url: server.url, tools: ['*'] };
  } else if (server.command) {
    existing.mcpServers[name] = {
      type: 'local',
      command: server.command,
      args: server.args || [],
      tools: ['*']
    };
    if (server.env) existing.mcpServers[name].env = server.env;
  }
}

console.log(JSON.stringify(existing, null, 2));
" "$existing")

echo "$updated" > "$COPILOT_MCP"
echo "Copilot CLI MCP servers configured from .vscode/mcp.json:"
echo "$updated" | node -e "
const cfg = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
for (const [name, s] of Object.entries(cfg.mcpServers || {})) {
  console.log('  ' + name + ' (' + s.type + ')');
}
"
