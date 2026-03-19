#!/usr/bin/env node

// spec2cloud CLI — selective installer
// Downloads only the files needed from GitHub (not the entire repo).
// Falls back to archive download if the GitHub API is unavailable.

import {
  existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, statSync,
  rmSync, copyFileSync,
} from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { execSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const REPO = 'EmeaAppGbb/spec2cloud';
const DEFAULT_REF = 'vNext';
const PKG_VERSION = '2.0.0';
const MAX_CONCURRENT = 15;

// ---------------------------------------------------------------------------
// Colors & logging
// ---------------------------------------------------------------------------
const tty = process.stdout.isTTY && !process.env.NO_COLOR;
const esc = (code, s) => tty ? `\x1b[${code}m${s}\x1b[0m` : s;
const c = {
  red: s => esc('31', s), green: s => esc('32', s),
  yellow: s => esc('33', s), blue: s => esc('34', s), bold: s => esc('1', s),
};
const log = {
  info:    msg => console.log(`${c.blue('ℹ')} ${msg}`),
  success: msg => console.log(`${c.green('✓')} ${msg}`),
  warn:    msg => console.log(`${c.yellow('⚠')} ${msg}`),
  error:   msg => console.error(`${c.red('✗')} ${msg}`),
};

// ---------------------------------------------------------------------------
// Manifest — what to download and where to put it
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
  'specs/features', 'specs/tasks', 'specs/docs', '.spec2cloud',
];

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
  --target <dir>    Target directory (default: current directory)
  --force           Overwrite existing files without prompting
  --help, -h        Show this help message
  --version, -v     Show version

${c.bold('EXAMPLES')}
  npx spec2cloud init
  npx spec2cloud init --minimal
  npx spec2cloud init --ref main
  npx spec2cloud init --target ./my-project
  npx spec2cloud init --ref feature/new-skills --force
`);
}

function printNextSteps() {
  console.log();
  console.log(c.green(c.bold('✨ Spec2Cloud installation complete!')));
  console.log(`
${c.bold('Next steps:')}

1. Open your project in VS Code with GitHub Copilot
2. The spec2cloud orchestrator (AGENTS.md) and 43 skills are now active
3. Start a conversation with Copilot to begin:

   ${c.blue('Greenfield (New Project):')}
     • "Create a PRD for [your app idea]"
     • "Start the spec2cloud greenfield workflow"

   ${c.blue('Brownfield (Existing Code):')}
     • "Analyze this codebase and generate specs"
     • "Start the spec2cloud brownfield workflow"

4. ${c.bold('Learn more:')} https://github.com/${REPO}
`);
}

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const opts = { command: null, mode: 'full', ref: DEFAULT_REF, target: '.', force: false };
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
      case '--help': case '-h':
        printHelp();
        process.exit(0);
        break; // unreachable but explicit
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
// Primary path: selective download via GitHub API + raw.githubusercontent.com
// ---------------------------------------------------------------------------

async function fetchTree(ref) {
  const url = `https://api.github.com/repos/${REPO}/git/trees/${ref}?recursive=1`;
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

function buildFileList(tree, mode) {
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

async function downloadFilesSelective(ref, files) {
  const contents = new Map();
  const queue = [...files];

  async function worker() {
    while (queue.length > 0) {
      const file = queue.shift();
      const url = `https://raw.githubusercontent.com/${REPO}/${ref}/${file.src}`;
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

function downloadArchive(ref) {
  const url = `https://github.com/${REPO}/archive/${ref}.tar.gz`;
  const tempDir = join(tmpdir(), `spec2cloud-${Date.now()}`);
  mkdirSync(tempDir, { recursive: true });
  const archive = join(tempDir, 'spec2cloud.tar.gz');

  try {
    execSync(`curl -fsSL "${url}" -o "${archive}"`, { stdio: 'pipe' });
  } catch {
    log.error(`Failed to download archive from: ${url}`);
    log.info(`Check that ref '${ref}' exists at: https://github.com/${REPO}`);
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

function buildFileListFromDisk(pkgRoot, mode) {
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

function walkDir(absDir, relDir, suffix, out) {
  for (const entry of readdirSync(absDir)) {
    const absPath = join(absDir, entry);
    const relPath = relDir + '/' + entry;
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
  for (const dir of ['specs', 'specs/features', 'specs/tasks', 'specs/docs']) {
    const gk = join(target, dir, '.gitkeep');
    if (!existsSync(gk)) writeFileSync(gk, '');
  }

  return mergeBackups;
}

function printStats(files, mergeBackups) {
  const skills  = new Set(
    files.filter(f => f.dest.startsWith('.github/skills/'))
      .map(f => f.dest.split('/').slice(0, 3).join('/')),
  ).size;

  log.success(`Installed ${c.bold(String(skills))} skills`);

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

  if (opts.command !== 'init') {
    log.error(opts.command ? `Unknown command: ${opts.command}` : 'No command specified.');
    console.log('Usage: npx spec2cloud init [options]');
    process.exit(1);
  }

  printHeader();
  log.info(`Mode: ${c.bold(opts.mode)}`);
  log.info(`Ref: ${c.bold(opts.ref)}`);
  log.info(`Target: ${c.bold(resolve(opts.target))}`);
  console.log();

  let files, contents;

  try {
    // Primary path: selective download
    log.info('Fetching file tree from GitHub...');
    const tree = await fetchTree(opts.ref);
    files = buildFileList(tree, opts.mode);
    log.success(`Resolved ${c.bold(String(files.length))} files to download`);

    log.info('Downloading...');
    contents = await downloadFilesSelective(opts.ref, files);
    log.success(`Downloaded ${c.bold(String(contents.size))} files`);
  } catch (err) {
    // Fallback: archive download
    log.warn(`Selective download unavailable: ${err.message}`);
    log.info('Falling back to full archive download...');

    const { tempDir, pkgRoot } = downloadArchive(opts.ref);
    log.success('Downloaded and extracted archive');

    files = buildFileListFromDisk(pkgRoot, opts.mode);
    contents = readFilesFromDisk(pkgRoot, files);

    cleanup(tempDir);
  }

  log.info(`Installing to ${c.bold(resolve(opts.target))} ...`);
  const mergeBackups = installFiles(files, contents, opts.target, opts.force);

  printStats(files, mergeBackups);
  printNextSteps();
}

main().catch(err => {
  log.error(err.message);
  process.exit(1);
});
