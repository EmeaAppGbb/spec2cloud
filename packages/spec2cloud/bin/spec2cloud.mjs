#!/usr/bin/env node

// spec2cloud CLI — selective installer with interactive flow selection
// Downloads only the files needed from GitHub (not the entire repo).
// Supports greenfield (flow-only or flow+shell) and brownfield workflows.
// Falls back to archive download if the GitHub API is unavailable.

import {
  existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, statSync,
  rmSync,
} from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { execSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { createInterface } from 'node:readline';

const REPO = 'EmeaAppGbb/spec2cloud';
const DEFAULT_ORG = 'EmeaAppGbb';
const SHELL_TOPIC = 'spec2cloud-shell';
const DEFAULT_REF = 'vNext';
const PKG_VERSION = '2.3.0';
const MAX_CONCURRENT = 15;

// ---------------------------------------------------------------------------
// Colors & logging
// ---------------------------------------------------------------------------
const tty = process.stdout.isTTY && !process.env.NO_COLOR;
const esc = (code, s) => tty ? `\x1b[${code}m${s}\x1b[0m` : s;
const c = {
  red: s => esc('31', s), green: s => esc('32', s),
  yellow: s => esc('33', s), blue: s => esc('34', s),
  cyan: s => esc('36', s), dim: s => esc('2', s), bold: s => esc('1', s),
};
const log = {
  info:    msg => console.log(`${c.blue('ℹ')} ${msg}`),
  success: msg => console.log(`${c.green('✓')} ${msg}`),
  warn:    msg => console.log(`${c.yellow('⚠')} ${msg}`),
  error:   msg => console.error(`${c.red('✗')} ${msg}`),
};

// ---------------------------------------------------------------------------
// Shell registry — dynamic discovery via GitHub topics
// ---------------------------------------------------------------------------
// Shell repos self-declare by adding the topic "spec2cloud-shell".
// Each shell repo has an optional shell.json at root with { id, name, desc }.
// If shell.json is missing, metadata is derived from the GitHub repo itself.
// Falls back to shells.json in the spec2cloud repo, then to a hardcoded list.
// ---------------------------------------------------------------------------

// Last-resort fallback — used when both dynamic discovery and shells.json fail
const FALLBACK_SHELLS = [
  {
    id: 'typescript',
    name: 'TypeScript (Next.js + Express)',
    desc: 'Next.js, Express, Playwright, Cucumber, Vitest',
    repo: 'EmeaAppGbb/shell-typescript',
  },
  {
    id: 'dotnet',
    name: '.NET (ASP.NET Core)',
    desc: 'ASP.NET Core, Blazor, .NET testing',
    repo: 'EmeaAppGbb/shell-dotnet',
  },
  {
    id: 'agentic-dotnet',
    name: 'Agentic .NET',
    desc: '.NET + AI Agents (LangGraph)',
    repo: 'EmeaAppGbb/agentic-shell-dotnet',
  },
  {
    id: 'agentic-python',
    name: 'Agentic Python',
    desc: 'Python + AI Agents (LangGraph)',
    repo: 'EmeaAppGbb/agentic-shell-python',
  },
];

let SHELLS = null;

/** Fetch shell.json manifest from a repo root. Returns null on failure. */
async function fetchShellManifest(repo, ref = 'main') {
  const url = `https://raw.githubusercontent.com/${repo}/${ref}/shell.json`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'spec2cloud-cli' } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Discover shell repos in a GitHub org by topic. */
async function discoverShellsByTopic(org) {
  // Use GitHub search API to find repos with the spec2cloud-shell topic
  const query = encodeURIComponent(`topic:${SHELL_TOPIC} org:${org}`);
  const url = `https://api.github.com/search/repositories?q=${query}&per_page=50`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'spec2cloud-cli', Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.items || data.items.length === 0) return null;

    // For each discovered repo, fetch shell.json for rich metadata
    const shells = await Promise.all(data.items.map(async (r) => {
      const manifest = await fetchShellManifest(r.full_name, r.default_branch);
      return {
        id: manifest?.id || r.name,
        name: manifest?.name || r.name,
        desc: manifest?.desc || r.description || '',
        repo: r.full_name,
      };
    }));

    // Sort alphabetically by id for stable ordering
    shells.sort((a, b) => a.id.localeCompare(b.id));
    return shells;
  } catch {
    return null;
  }
}

/** Fetch the static shells.json registry from the spec2cloud repo. */
async function fetchShellsJson(ref) {
  const url = `https://raw.githubusercontent.com/${REPO}/${ref}/shells.json`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'spec2cloud-cli' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Empty registry');
    return data;
  } catch {
    return null;
  }
}

/**
 * Get available shells using a tiered strategy:
 *   1. Dynamic discovery via GitHub topic (spec2cloud-shell) in the org
 *   2. Static shells.json from the spec2cloud repo
 *   3. Hardcoded FALLBACK_SHELLS
 */
async function fetchShellRegistry(org, ref) {
  // Tier 1: dynamic topic-based discovery
  const discovered = await discoverShellsByTopic(org);
  if (discovered && discovered.length > 0) {
    log.info(`Discovered ${c.bold(String(discovered.length))} shell(s) from ${c.cyan(org)} via topic ${c.dim(SHELL_TOPIC)}`);
    return discovered;
  }

  // Tier 2: static shells.json
  log.info(`No shells found via topic discovery. Trying shells.json registry...`);
  const fromJson = await fetchShellsJson(ref);
  if (fromJson) return fromJson;

  // Tier 3: hardcoded fallback
  log.warn('Could not fetch shell registry. Using built-in list.');
  return FALLBACK_SHELLS;
}

async function getShells(org, ref) {
  if (!SHELLS) SHELLS = await fetchShellRegistry(org, ref);
  return SHELLS;
}

async function fetchBranches(repo) {
  const url = `https://api.github.com/repos/${repo}/branches?per_page=100`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'spec2cloud-cli', Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.map(b => b.name);
  } catch {
    return ['main'];
  }
}

// ---------------------------------------------------------------------------
// Manifest — what to download from the spec2cloud core repo
// ---------------------------------------------------------------------------
const SOURCES = [
  // Always installed
  { src: '.github/skills',   kind: 'dir' },
  { src: 'AGENTS.md',        kind: 'file', merge: true },
  { src: 'skills-lock.json', kind: 'file' },
  // Full mode only
  { src: '.vscode/mcp.json',                    kind: 'file', merge: true, fullOnly: true },
  { src: '.mcp.json',                            kind: 'file', merge: true, fullOnly: true },
  { src: '.devcontainer/devcontainer.json',      kind: 'file', merge: true, fullOnly: true },
  { src: '.github/copilot-instructions.md',      kind: 'file', merge: true, fullOnly: true },
];

// Standard directories to create in the target project
const SCAFFOLD_DIRS = [
  '.github/skills',
  'specs/features', 'specs/tasks', 'specs/docs', 'specs/domain', '.spec2cloud',
];

// ---------------------------------------------------------------------------
// Interactive prompts (zero dependencies — raw stdin/stdout)
// ---------------------------------------------------------------------------

function promptSelect(question, choices) {
  return new Promise((resolvePromise, reject) => {
    if (!process.stdin.isTTY) {
      reject(new Error('Interactive prompts require a TTY. Use --flow and --shell flags instead.'));
      return;
    }

    let selected = 0;

    function render() {
      // Move cursor up to overwrite previous render (except first)
      if (render._rendered) {
        process.stdout.write(`\x1b[${choices.length}A`);
      }
      for (let i = 0; i < choices.length; i++) {
        const prefix = i === selected ? c.cyan('  ❯ ') : '    ';
        const label = i === selected ? c.bold(choices[i].name) : choices[i].name;
        const desc = choices[i].desc ? c.dim(` — ${choices[i].desc}`) : '';
        process.stdout.write(`\x1b[2K${prefix}${label}${desc}\n`);
      }
      render._rendered = true;
    }

    console.log();
    console.log(c.bold(`? ${question}`));
    console.log();
    render();

    const wasRaw = process.stdin.isRaw;
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    function onData(key) {
      // Ctrl+C
      if (key === '\x03') {
        process.stdin.setRawMode(wasRaw ?? false);
        process.stdin.pause();
        process.stdin.removeListener('data', onData);
        console.log();
        log.info('Cancelled.');
        process.exit(0);
      }

      // Up arrow or k
      if (key === '\x1b[A' || key === 'k') {
        selected = (selected - 1 + choices.length) % choices.length;
        render();
        return;
      }
      // Down arrow or j
      if (key === '\x1b[B' || key === 'j') {
        selected = (selected + 1) % choices.length;
        render();
        return;
      }

      // Enter
      if (key === '\r' || key === '\n') {
        process.stdin.setRawMode(wasRaw ?? false);
        process.stdin.pause();
        process.stdin.removeListener('data', onData);
        // Show final selection
        process.stdout.write(`\x1b[${choices.length}A`);
        for (let i = 0; i < choices.length; i++) {
          process.stdout.write(`\x1b[2K`);
          if (i === selected) {
            process.stdout.write(`  ${c.green('✓')} ${c.bold(choices[i].name)}\n`);
          } else {
            process.stdout.write('\n');
          }
        }
        // Clean up blank lines
        process.stdout.write(`\x1b[${choices.length - 1}A`);
        for (let i = 0; i < choices.length - 1; i++) {
          process.stdout.write(`\x1b[1B\x1b[2K`);
        }
        process.stdout.write(`\x1b[${choices.length - 1}A\n`);
        console.log();
        resolvePromise(choices[selected]);
      }
    }

    process.stdin.on('data', onData);
  });
}

// ---------------------------------------------------------------------------
// CLI chrome
// ---------------------------------------------------------------------------
function printHeader() {
  console.log(c.blue(c.bold([
    '╔═══════════════════════════════════════════════════════════╗',
    '║              Spec2Cloud CLI Installer                     ║',
    '╚═══════════════════════════════════════════════════════════╝',
  ].join('\n'))));
  console.log();
}

function printHelp() {
  console.log(`${c.bold('spec2cloud')} — Install spec2cloud AI-powered development workflows

${c.bold('USAGE')}
  npx spec2cloud init [options]

${c.bold('COMMANDS')}
  init              Install spec2cloud into a project directory

${c.bold('OPTIONS')}
  --minimal         Install only skills and AGENTS.md (no devcontainer/MCP)
  --ref <ref>       Branch or tag to install from (default: ${DEFAULT_REF})
  --org <org>       GitHub org to discover shells from (default: ${DEFAULT_ORG})
  --target <dir>    Target directory (default: current directory)
  --force           Overwrite existing files without prompting
  --flow <type>     Skip flow prompt: greenfield or brownfield
  --shell <id>      Install a shell template (implies --flow greenfield)
  --shell-ref <ref> Branch or tag for the shell template (default: main)
  --list-shells     List available shell templates and exit
  --help, -h        Show this help message
  --version, -v     Show version

${c.bold('FLOW MODES')}
  ${c.cyan('brownfield')}        Add spec2cloud to an existing codebase
  ${c.cyan('greenfield')}        Start fresh — installs skills & orchestrator (you provide code)
  ${c.cyan('greenfield+shell')}  Start fresh with a complete project scaffold

${c.bold('SHELL DISCOVERY')}
  Shells are discovered automatically from GitHub repos tagged with the
  topic "${SHELL_TOPIC}" in the configured org. Each shell repo can include a
  shell.json at root with { id, name, desc } for rich metadata.
  Use --list-shells to see discovered shells. Use --org to search a different org.

${c.bold('EXAMPLES')}
  npx spec2cloud init                           # Interactive mode
  npx spec2cloud init --flow brownfield          # Skip prompts — brownfield
  npx spec2cloud init --flow greenfield          # Skip prompts — greenfield (flow only)
  npx spec2cloud init --shell typescript         # Greenfield with TypeScript shell
  npx spec2cloud init --shell dotnet --shell-ref dev  # Shell from dev branch
  npx spec2cloud init --org my-org --list-shells # List shells from a different org
  npx spec2cloud init --minimal                  # Skills & AGENTS.md only
  npx spec2cloud init --ref main --force         # From main branch, overwrite
`);
}

async function printShellList(org, ref) {
  const shells = await getShells(org, ref);
  console.log(c.bold('Available shell templates:\n'));
  for (const s of shells) {
    console.log(`  ${c.bold(s.id.padEnd(22))} ${s.name}`);
    console.log(`  ${''.padEnd(22)} ${c.dim(s.desc)}`);
    console.log(`  ${''.padEnd(22)} ${c.dim(s.repo)}`);
    console.log();
  }
}

function printNextSteps(flow, shell) {
  console.log();
  console.log(c.green(c.bold('✨ Spec2Cloud installation complete!')));

  if (shell) {
    console.log(`
${c.bold('Shell installed:')} ${shell.name} ${c.dim(`(${shell.repo})`)}
`);
  }

  console.log(`${c.bold('Next steps:')}

1. Open your project in VS Code with GitHub Copilot
2. The spec2cloud orchestrator (AGENTS.md) and skills are now active
3. Start a conversation with Copilot to begin:`);

  if (flow === 'greenfield') {
    console.log(`
   ${c.cyan('•')} "Create a PRD for [your app idea]"
   ${c.cyan('•')} "Start the spec2cloud greenfield workflow"
`);
  } else if (flow === 'brownfield') {
    console.log(`
   ${c.cyan('•')} "Analyze this codebase and generate specs"
   ${c.cyan('•')} "Start the spec2cloud brownfield workflow"
`);
  } else {
    console.log(`
   ${c.blue('Greenfield (New Project):')}
     • "Create a PRD for [your app idea]"

   ${c.blue('Brownfield (Existing Code):')}
     • "Analyze this codebase and generate specs"
`);
  }

  console.log(`4. ${c.bold('Learn more:')} https://github.com/${REPO}
`);
}

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const opts = {
    command: null, mode: 'full', ref: DEFAULT_REF, org: DEFAULT_ORG, target: '.',
    force: false, flow: null, shell: null, shellId: null, shellRef: null, listShells: false,
  };
  let i = 0;

  while (i < argv.length) {
    switch (argv[i]) {
      case 'init':
        opts.command = 'init';
        break;
      case '--minimal':
        opts.mode = 'minimal';
        break;
      case '--ref': case '--branch': case '--tag':
        if (!argv[i + 1]) { log.error(`${argv[i]} requires a value`); process.exit(1); }
        opts.ref = argv[++i];
        break;
      case '--target':
        if (!argv[i + 1]) { log.error('--target requires a directory path'); process.exit(1); }
        opts.target = argv[++i];
        break;
      case '--force':
        opts.force = true;
        break;
      case '--flow': {
        if (!argv[i + 1]) { log.error('--flow requires a value (greenfield or brownfield)'); process.exit(1); }
        const val = argv[++i].toLowerCase();
        if (val !== 'greenfield' && val !== 'brownfield') {
          log.error(`Invalid flow: "${val}". Must be "greenfield" or "brownfield".`);
          process.exit(1);
        }
        opts.flow = val;
        break;
      }
      case '--shell': {
        if (!argv[i + 1]) { log.error('--shell requires a shell id'); process.exit(1); }
        opts.shellId = argv[++i].toLowerCase();
        opts.flow = 'greenfield';
        break;
      }
      case '--shell-ref': {
        if (!argv[i + 1]) { log.error('--shell-ref requires a value'); process.exit(1); }
        opts.shellRef = argv[++i];
        break;
      }
      case '--org': {
        if (!argv[i + 1]) { log.error('--org requires a GitHub organization name'); process.exit(1); }
        opts.org = argv[++i];
        break;
      }
      case '--list-shells':
        opts.listShells = true;
        break;
      case '--help': case '-h':
        printHelp();
        process.exit(0);
        break;
      case '--version': case '-v':
        console.log(PKG_VERSION);
        process.exit(0);
        break;
      default:
        log.error(`Unknown option: ${argv[i]}`);
        console.log('Run "npx spec2cloud --help" for usage information.');
        process.exit(1);
    }
    i++;
  }
  return opts;
}

// ---------------------------------------------------------------------------
// Interactive flow selection
// ---------------------------------------------------------------------------

async function selectFlow(opts) {
  const shells = await getShells(opts.org, opts.ref);

  // Resolve --shell id if provided via CLI flag
  if (opts.shellId) {
    const match = shells.find(s => s.id === opts.shellId);
    if (!match) {
      log.error(`Unknown shell: "${opts.shellId}"`);
      log.info(`Available shells: ${shells.map(s => s.id).join(', ')}`);
      process.exit(1);
    }
    opts.shell = match;
  }

  // Already set via flags
  if (opts.flow && opts.shell) return { flow: opts.flow, shell: opts.shell, shellRef: opts.shellRef };
  if (opts.flow === 'brownfield') return { flow: 'brownfield', shell: null, shellRef: null };
  if (opts.flow === 'greenfield' && !opts.shell) return { flow: 'greenfield', shell: null, shellRef: null };

  // Non-interactive — default to brownfield-style install
  if (!process.stdin.isTTY) {
    log.info('Non-interactive mode detected. Installing core spec2cloud (brownfield-compatible).');
    log.info('Use --flow and --shell flags for non-interactive flow selection.');
    return { flow: null, shell: null, shellRef: null };
  }

  // Step 1: Greenfield vs Brownfield
  const flowChoice = await promptSelect('What would you like to do?', [
    { name: 'Greenfield', desc: 'Start a new project from scratch', value: 'greenfield' },
    { name: 'Brownfield', desc: 'Add spec2cloud to an existing codebase', value: 'brownfield' },
  ]);

  if (flowChoice.value === 'brownfield') {
    return { flow: 'brownfield', shell: null, shellRef: null };
  }

  // Step 2: Greenfield — Flow only vs Flow + Shell
  const setupChoice = await promptSelect('How would you like to set up your greenfield project?', [
    { name: 'Flow only', desc: 'Install spec2cloud skills & orchestrator (you provide the code)', value: 'flow-only' },
    { name: 'Flow + Shell', desc: 'Install skills + a complete project scaffold for your stack', value: 'flow-shell' },
  ]);

  if (setupChoice.value === 'flow-only') {
    return { flow: 'greenfield', shell: null, shellRef: null };
  }

  // Step 3: Pick a shell
  const shellChoice = await promptSelect('Select a shell template:', shells.map(s => ({
    name: s.name,
    desc: s.desc,
    value: s,
  })));

  const selectedShell = shellChoice.value;

  // Step 4: Pick a branch for the shell
  let shellRef = opts.shellRef;
  if (!shellRef) {
    log.info(`Fetching branches for ${c.bold(selectedShell.name)}...`);
    const branches = await fetchBranches(selectedShell.repo);

    if (branches.length > 1) {
      const branchChoice = await promptSelect('Select a branch:', branches.map(b => ({
        name: b,
        desc: b === 'main' ? 'default branch' : '',
        value: b,
      })));
      shellRef = branchChoice.value;
    } else {
      shellRef = branches[0] || 'main';
    }
  }

  return { flow: 'greenfield', shell: selectedShell, shellRef };
}

// ---------------------------------------------------------------------------
// Primary path: selective download via GitHub API + raw.githubusercontent.com
// ---------------------------------------------------------------------------

async function fetchTree(repo, ref) {
  const url = `https://api.github.com/repos/${repo}/git/trees/${ref}?recursive=1`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'spec2cloud-cli', Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) {
    const hint = res.status === 403 ? ' (rate limit — try again in a few minutes)' : '';
    throw new Error(`GitHub API returned ${res.status}${hint}`);
  }
  const data = await res.json();
  if (data.truncated) throw new Error('Repository tree was truncated by GitHub');
  return data.tree.filter(e => e.type === 'blob');
}

function buildCoreFileList(tree, mode) {
  const sources = SOURCES.filter(s => !s.fullOnly || mode === 'full');
  const files = [];

  for (const source of sources) {
    if (source.kind === 'file') {
      if (tree.some(t => t.path === source.src)) {
        files.push({ src: source.src, dest: source.dest || source.src, merge: !!source.merge });
      }
    } else {
      const prefix = source.src + '/';
      for (const t of tree) {
        if (!t.path.startsWith(prefix)) continue;
        if (source.suffix && !t.path.endsWith(source.suffix)) continue;
        files.push({ src: t.path, dest: t.path, merge: false });
      }
    }
  }

  return files;
}

function buildShellFileList(tree) {
  // Download everything in the shell repo except .git internals
  return tree.map(t => ({ src: t.path, dest: t.path, merge: false }));
}

async function downloadFilesSelective(repo, ref, files) {
  const contents = new Map();
  const queue = [...files];

  async function worker() {
    while (queue.length > 0) {
      const file = queue.shift();
      const url = `https://raw.githubusercontent.com/${repo}/${ref}/${file.src}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to download ${file.src} (HTTP ${res.status})`);
      contents.set(file.src, Buffer.from(await res.arrayBuffer()));
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(MAX_CONCURRENT, files.length) }, () => worker()),
  );
  return contents;
}

// ---------------------------------------------------------------------------
// Fallback path: archive download (when API is unavailable)
// ---------------------------------------------------------------------------

function downloadArchive(repo, ref) {
  const url = `https://github.com/${repo}/archive/${ref}.tar.gz`;
  const tempDir = join(tmpdir(), `spec2cloud-${Date.now()}`);
  mkdirSync(tempDir, { recursive: true });
  const archive = join(tempDir, 'spec2cloud.tar.gz');

  try {
    execSync(`curl -fsSL "${url}" -o "${archive}"`, { stdio: 'pipe' });
  } catch {
    log.error(`Failed to download archive from: ${url}`);
    log.info(`Check that ref '${ref}' exists at: https://github.com/${repo}`);
    cleanup(tempDir);
    process.exit(1);
  }

  try {
    execSync(`tar -xzf "${archive}" -C "${tempDir}"`, { stdio: 'pipe' });
  } catch {
    log.error('Failed to extract archive');
    cleanup(tempDir);
    process.exit(1);
  }

  const dirs = readdirSync(tempDir).filter(
    e => e !== basename(archive) && statSync(join(tempDir, e)).isDirectory(),
  );
  if (dirs.length === 0) { log.error('Extracted archive is empty'); cleanup(tempDir); process.exit(1); }

  return { tempDir, pkgRoot: join(tempDir, dirs[0]) };
}

function buildCoreFileListFromDisk(pkgRoot, mode) {
  const sources = SOURCES.filter(s => !s.fullOnly || mode === 'full');
  const files = [];

  for (const source of sources) {
    if (source.kind === 'file') {
      if (existsSync(join(pkgRoot, source.src))) {
        files.push({ src: source.src, dest: source.dest || source.src, merge: !!source.merge });
      }
    } else {
      const dir = join(pkgRoot, source.src);
      if (!existsSync(dir)) continue;
      walkDir(dir, source.src, source.suffix, files);
    }
  }
  return files;
}

function buildShellFileListFromDisk(pkgRoot) {
  const files = [];
  walkDir(pkgRoot, '', null, files);
  // Trim leading '/' from dest paths
  return files.map(f => ({ ...f, src: f.src.replace(/^\//, ''), dest: f.dest.replace(/^\//, '') }));
}

function walkDir(absDir, relDir, suffix, out) {
  for (const entry of readdirSync(absDir)) {
    const absPath = join(absDir, entry);
    const relPath = relDir ? relDir + '/' + entry : entry;
    if (statSync(absPath).isDirectory()) {
      walkDir(absPath, relPath, suffix, out);
    } else {
      if (suffix && !entry.endsWith(suffix)) continue;
      out.push({ src: relPath, dest: relPath, merge: false });
    }
  }
}

function readFilesFromDisk(pkgRoot, files) {
  const contents = new Map();
  for (const f of files) {
    const abs = join(pkgRoot, f.src);
    if (existsSync(abs)) {
      contents.set(f.src, readFileSync(abs));
    }
  }
  return contents;
}

// ---------------------------------------------------------------------------
// Download orchestration — core and shell
// ---------------------------------------------------------------------------

async function downloadCore(opts) {
  try {
    log.info('Fetching spec2cloud file tree from GitHub...');
    const tree = await fetchTree(REPO, opts.ref);
    const files = buildCoreFileList(tree, opts.mode);
    log.success(`Resolved ${c.bold(String(files.length))} core files`);

    log.info('Downloading core files...');
    const contents = await downloadFilesSelective(REPO, opts.ref, files);
    log.success(`Downloaded ${c.bold(String(contents.size))} core files`);
    return { files, contents };
  } catch (err) {
    log.warn(`Selective download unavailable: ${err.message}`);
    log.info('Falling back to archive download...');

    const { tempDir, pkgRoot } = downloadArchive(REPO, opts.ref);
    log.success('Downloaded and extracted core archive');

    const files = buildCoreFileListFromDisk(pkgRoot, opts.mode);
    const contents = readFilesFromDisk(pkgRoot, files);
    cleanup(tempDir);
    return { files, contents };
  }
}

async function downloadShell(shell, shellRef) {
  try {
    log.info(`Fetching shell template: ${c.bold(shell.name)} ${c.dim(`(ref: ${shellRef})`)}...`);
    const tree = await fetchTree(shell.repo, shellRef);
    const files = buildShellFileList(tree);
    log.success(`Resolved ${c.bold(String(files.length))} shell files`);

    log.info('Downloading shell files...');
    const contents = await downloadFilesSelective(shell.repo, shellRef, files);
    log.success(`Downloaded ${c.bold(String(contents.size))} shell files`);
    return { files, contents };
  } catch (err) {
    log.warn(`Selective download unavailable: ${err.message}`);
    log.info('Falling back to archive download for shell...');

    const { tempDir, pkgRoot } = downloadArchive(shell.repo, shellRef);
    log.success('Downloaded and extracted shell archive');

    const files = buildShellFileListFromDisk(pkgRoot);
    const contents = readFilesFromDisk(pkgRoot, files);
    cleanup(tempDir);
    return { files, contents };
  }
}

// ---------------------------------------------------------------------------
// Install: write files to target directory
// ---------------------------------------------------------------------------

function installFiles(files, contents, targetDir, force) {
  const target = resolve(targetDir);
  const mergeBackups = [];

  // Scaffold standard directories
  for (const dir of SCAFFOLD_DIRS) mkdirSync(join(target, dir), { recursive: true });

  if (existsSync(join(target, '.github', 'skills')) && !force) {
    const existing = readdirSync(join(target, '.github', 'skills')).length;
    if (existing > 0) log.warn('Spec2cloud already exists in this project. Existing files will be preserved.');
  }

  for (const file of files) {
    const buf = contents.get(file.src);
    if (!buf) continue;

    const destPath = join(target, file.dest);
    mkdirSync(dirname(destPath), { recursive: true });

    if (file.merge && existsSync(destPath) && !force) {
      writeFileSync(`${destPath}.spec2cloud`, buf);
      mergeBackups.push(file.dest);
    } else {
      writeFileSync(destPath, buf);
    }
  }

  // .gitkeep files
  for (const dir of ['specs', 'specs/features', 'specs/tasks', 'specs/docs', 'specs/domain']) {
    const gk = join(target, dir, '.gitkeep');
    if (!existsSync(gk)) writeFileSync(gk, '');
  }

  return mergeBackups;
}

function printStats(coreFiles, shellFiles, mergeBackups) {
  const skills = new Set(
    coreFiles.filter(f => f.dest.startsWith('.github/skills/'))
      .map(f => f.dest.split('/').slice(0, 3).join('/')),
  ).size;

  log.success(`Installed ${c.bold(String(skills))} skills`);
  if (shellFiles.length > 0) {
    log.success(`Installed ${c.bold(String(shellFiles.length))} shell template files`);
  }

  if (mergeBackups.length > 0) {
    console.log();
    log.warn('Files requiring manual merge:');
    for (const f of mergeBackups) console.log(`  • ${f}.spec2cloud`);
  }
}

function cleanup(dir) {
  try { rmSync(dir, { recursive: true, force: true }); } catch { /* ignore */ }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) { printHelp(); process.exit(0); }

  const opts = parseArgs(args);

  // Handle --list-shells
  if (opts.listShells) {
    await printShellList(opts.org, opts.ref);
    process.exit(0);
  }

  if (opts.command !== 'init') {
    log.error(opts.command ? `Unknown command: ${opts.command}` : 'No command specified.');
    console.log('Usage: npx spec2cloud init [options]');
    process.exit(1);
  }

  printHeader();

  // Interactive flow selection
  const { flow, shell, shellRef } = await selectFlow(opts);

  log.info(`Mode: ${c.bold(opts.mode)}`);
  log.info(`Flow: ${c.bold(flow || 'default')}`);
  if (shell) log.info(`Shell: ${c.bold(shell.name)} ${c.dim(`(${shell.repo})`)}`);
  if (shellRef) log.info(`Shell ref: ${c.bold(shellRef)}`);
  log.info(`Ref: ${c.bold(opts.ref)}`);
  log.info(`Target: ${c.bold(resolve(opts.target))}`);
  console.log();

  // Download shell first (if selected), then layer core on top
  let shellFiles = [];
  if (shell) {
    const effectiveShellRef = shellRef || 'main';
    const shellResult = await downloadShell(shell, effectiveShellRef);
    shellFiles = shellResult.files;
    console.log();
    log.info(`Installing shell to ${c.bold(resolve(opts.target))} ...`);
    installFiles(shellResult.files, shellResult.contents, opts.target, opts.force);
    console.log();
  }

  // Download and install core spec2cloud files
  const coreResult = await downloadCore(opts);
  log.info(`Installing spec2cloud core to ${c.bold(resolve(opts.target))} ...`);
  const mergeBackups = installFiles(coreResult.files, coreResult.contents, opts.target, opts.force);

  printStats(coreResult.files, shellFiles, mergeBackups);
  printNextSteps(flow, shell);
}

main().catch(err => {
  log.error(err.message);
  process.exit(1);
});
