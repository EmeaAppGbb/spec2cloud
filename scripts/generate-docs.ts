#!/usr/bin/env node

/**
 * generate-docs.ts
 *
 * Parses Gherkin .feature files and matches them with Playwright screenshots
 * to produce MkDocs-compatible markdown pages — one page per feature,
 * each scenario rendered as a visual step-by-step walkthrough.
 *
 * Usage:  npx ts-node scripts/generate-docs.ts
 *
 * Input:
 *   specs/features/*.feature        — Gherkin source files
 *   docs/screenshots/{feature}/     — screenshots captured by Cucumber hooks
 *   specs/ui/                       — UI/UX specs from Phase 2 (screen map, design system, components, prototypes, walkthrough)
 *
 * Output:
 *   docs/features/{feature-slug}.md — one MkDocs page per feature (with wireframe comparison)
 *   docs/design/screen-map.md       — screen inventory from Phase 2
 *   docs/design/design-system.md    — design tokens reference
 *   docs/design/components.md       — component inventory
 *   docs/design/walkthrough.md      — embedded visual walkthrough
 *   docs/design/prototypes/         — HTML wireframe prototypes (browsable)
 *   docs/nav.yml                    — auto-generated navigation partial
 */

import * as fs from 'fs';
import * as path from 'path';
import * as Gherkin from '@cucumber/gherkin';
import * as Messages from '@cucumber/messages';

// ── Paths ──────────────────────────────────────────────────────
const ROOT = process.cwd();
const FEATURES_DIR = path.join(ROOT, 'specs', 'features');
const SCREENSHOTS_DIR = path.join(ROOT, 'docs', 'screenshots');
const UI_SPECS_DIR = path.join(ROOT, 'specs', 'ui');
const OUTPUT_DIR = path.join(ROOT, 'docs', 'features');
const DESIGN_OUTPUT_DIR = path.join(ROOT, 'docs', 'design');
const INDEX_FILE = path.join(ROOT, 'docs', 'index.md');

// ── Helpers ────────────────────────────────────────────────────
function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function findScreenshots(featureSlug: string, scenarioSlug: string): string[] {
  const dir = path.join(SCREENSHOTS_DIR, featureSlug, scenarioSlug);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.png') && !f.startsWith('999-'))
    .sort();
}

function findFinalScreenshot(featureSlug: string, scenarioSlug: string): { filename: string; status: string } | undefined {
  const dir = path.join(SCREENSHOTS_DIR, featureSlug, scenarioSlug);
  if (!fs.existsSync(dir)) return undefined;
  const finals = fs.readdirSync(dir).filter(f => f.startsWith('999-'));
  if (finals.length === 0) return undefined;
  // Prefer final > skipped > failure
  const final = finals.find(f => f.includes('final')) || finals.find(f => f.includes('skipped')) || finals[0];
  const status = final.includes('failure') ? 'failure' : final.includes('skipped') ? 'skipped' : 'passed';
  return { filename: final, status };
}

function findWireframeForFeature(featureSlug: string): string[] {
  const prototypesDir = path.join(UI_SPECS_DIR, 'prototypes');
  if (!fs.existsSync(prototypesDir)) return [];
  // Match prototype HTML files whose name contains the feature slug or a related screen name
  return fs.readdirSync(prototypesDir)
    .filter(f => f.endsWith('.html') && f !== 'index.html')
    .sort();
}

function getScreenMapEntries(): Map<string, string[]> {
  // Parse screen-map.md to extract screen-name → FRD mapping
  const screenMapPath = path.join(UI_SPECS_DIR, 'screen-map.md');
  if (!fs.existsSync(screenMapPath)) return new Map();

  const content = fs.readFileSync(screenMapPath, 'utf-8');
  const screenToFrds = new Map<string, string[]>();
  const lines = content.split('\n');

  // Look for table rows or list items that map screens to FRDs
  for (const line of lines) {
    // Match patterns like "| Screen Name | frd-xxx |" or "- **Screen Name** — frd-xxx"
    const tableMatch = line.match(/\|\s*([^|]+?)\s*\|\s*([^|]*frd[^|]*)\s*\|/i);
    const listMatch = line.match(/[-*]\s*\*\*(.+?)\*\*.*?(frd-[\w-]+)/i);
    if (tableMatch) {
      const screenName = slugify(tableMatch[1].trim());
      const frds = tableMatch[2].match(/frd-[\w-]+/gi) || [];
      screenToFrds.set(screenName, frds.map(f => slugify(f)));
    } else if (listMatch) {
      const screenName = slugify(listMatch[1].trim());
      const frds = line.match(/frd-[\w-]+/gi) || [];
      screenToFrds.set(screenName, frds.map(f => slugify(f)));
    }
  }
  return screenToFrds;
}

function stepTextFromFilename(filename: string): string {
  // "001-the-user-logs-in.png" → "The user logs in"
  const withoutExt = filename.replace(/\.png$/, '');
  const withoutIndex = withoutExt.replace(/^\d+-/, '');
  const words = withoutIndex.split('-').filter(Boolean);
  if (words.length === 0) return filename;
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(' ');
}

// ── Gherkin Parsing ────────────────────────────────────────────
interface ParsedScenario {
  name: string;
  slug: string;
  tags: string[];
  steps: { keyword: string; text: string }[];
  description: string;
}

interface ParsedFeature {
  name: string;
  slug: string;
  description: string;
  tags: string[];
  scenarios: ParsedScenario[];
  sourceFile: string;
  rawGherkin: string;
}

function parseFeatureFile(filepath: string): ParsedFeature | null {
  const source = fs.readFileSync(filepath, 'utf-8');

  const uuidFn = Messages.IdGenerator.uuid();
  const builder = new Gherkin.AstBuilder(uuidFn);
  const matcher = new Gherkin.GherkinClassicTokenMatcher();

  let gherkinDoc: Messages.GherkinDocument;
  try {
    const parser = new Gherkin.Parser(builder, matcher);
    gherkinDoc = parser.parse(source) as unknown as Messages.GherkinDocument;
  } catch (e) {
    console.warn(`  ⚠ Could not parse ${filepath}: ${(e as Error).message}`);
    return null;
  }

  const feature = gherkinDoc.feature;
  if (!feature) return null;

  const scenarios: ParsedScenario[] = (feature.children || [])
    .filter(child => child.scenario)
    .map(child => {
      const sc = child.scenario!;
      return {
        name: sc.name,
        slug: slugify(sc.name),
        tags: (sc.tags || []).map(t => t.name),
        steps: (sc.steps || []).map(s => ({
          keyword: (s.keyword || '').trim(),
          text: s.text,
        })),
        description: sc.description?.trim() || '',
      };
    });

  return {
    name: feature.name,
    slug: slugify(feature.name),
    description: feature.description?.trim() || '',
    tags: (feature.tags || []).map(t => t.name),
    scenarios,
    sourceFile: path.basename(filepath),
    rawGherkin: source,
  };
}

// ── Markdown Generation ────────────────────────────────────────
function generateFeaturePage(feature: ParsedFeature, screenMap: Map<string, string[]>): string {
  const lines: string[] = [];

  lines.push(`# ${feature.name}`);
  lines.push('');

  if (feature.tags.length > 0) {
    lines.push(feature.tags.map(t => `\`${t}\``).join(' '));
    lines.push('');
  }

  if (feature.description) {
    lines.push(feature.description);
    lines.push('');
  }

  // Wireframe prototypes section — show related screens from Phase 2
  const prototypesDir = path.join(UI_SPECS_DIR, 'prototypes');
  if (fs.existsSync(prototypesDir)) {
    // Find prototype files related to this feature via screen map
    const relatedPrototypes: string[] = [];
    for (const [screenSlug, frds] of screenMap) {
      if (frds.some(frd => feature.slug.includes(frd) || frd.includes(feature.slug))) {
        const htmlFile = `${screenSlug}.html`;
        if (fs.existsSync(path.join(prototypesDir, htmlFile))) {
          relatedPrototypes.push(htmlFile);
        }
      }
    }

    // Also do a fuzzy match on prototype filenames containing the feature slug
    const allPrototypes = fs.readdirSync(prototypesDir).filter(f => f.endsWith('.html') && f !== 'index.html');
    for (const proto of allPrototypes) {
      const protoSlug = slugify(proto.replace('.html', ''));
      if ((protoSlug.includes(feature.slug) || feature.slug.includes(protoSlug)) && !relatedPrototypes.includes(proto)) {
        relatedPrototypes.push(proto);
      }
    }

    if (relatedPrototypes.length > 0) {
      lines.push('## 🎨 UI/UX Wireframes');
      lines.push('');
      lines.push('!!! info "Design Reference"');
      lines.push('    These wireframes were approved in Phase 2 (UI/UX Design) and serve as the visual specification for this feature.');
      lines.push('    See the full [Screen Map](../design/screen-map.md) and [Component Inventory](../design/components.md) for details.');
      lines.push('');
      for (const proto of relatedPrototypes) {
        const screenName = proto.replace('.html', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        lines.push(`### ${screenName}`);
        lines.push('');
        lines.push(`<iframe src="../design/prototypes/${proto}" width="100%" height="500" style="border: 1px solid #ddd; border-radius: 8px;"></iframe>`);
        lines.push('');
        lines.push(`<small>[Open wireframe in new tab](../design/prototypes/${proto}){target="_blank"}</small>`);
        lines.push('');
      }
      lines.push('---');
      lines.push('');
    }
  }

  // Collapsible Gherkin source
  lines.push('<details>');
  lines.push('<summary><strong>📄 Gherkin Source</strong> — click to expand</summary>');
  lines.push('');
  lines.push('```gherkin');
  lines.push(feature.rawGherkin.trim());
  lines.push('```');
  lines.push('</details>');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Scenario table of contents
  if (feature.scenarios.length > 1) {
    lines.push('## Scenarios');
    lines.push('');
    for (const sc of feature.scenarios) {
      lines.push(`- [${sc.name}](#${sc.slug})`);
    }
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Each scenario
  for (const scenario of feature.scenarios) {
    lines.push(`## ${scenario.name} {#${scenario.slug}}`);
    lines.push('');

    if (scenario.tags.length > 0) {
      lines.push(scenario.tags.map(t => `\`${t}\``).join(' '));
      lines.push('');
    }

    if (scenario.description) {
      lines.push(scenario.description);
      lines.push('');
    }

    const screenshots = findScreenshots(feature.slug, scenario.slug);
    const finalScreenshot = findFinalScreenshot(feature.slug, scenario.slug);

    if (screenshots.length > 0) {
      // Step-by-step walkthrough with screenshots
      for (let i = 0; i < scenario.steps.length; i++) {
        const step = scenario.steps[i];
        const matchingScreenshot = screenshots.find(s => s.startsWith(String(i + 1).padStart(3, '0')));
        const relPath = matchingScreenshot
          ? `../screenshots/${feature.slug}/${scenario.slug}/${matchingScreenshot}`
          : undefined;

        lines.push(`**${step.keyword}** ${step.text}`);
        lines.push('');
        if (relPath) {
          lines.push(`![${step.keyword} ${step.text}](${relPath})`);
          lines.push('');
        }
      }

      if (finalScreenshot) {
        const relPath = `../screenshots/${feature.slug}/${scenario.slug}/${finalScreenshot.filename}`;
        let label: string;
        switch (finalScreenshot.status) {
          case 'failure':
            label = '❌ Final State (Failed)';
            break;
          case 'skipped':
            label = '⏭️ Skipped / Pending';
            break;
          default:
            label = '✅ Final State';
        }
        lines.push(`### ${label}`);
        lines.push('');
        lines.push(`![Final state](${relPath})`);
        lines.push('');
      }
    } else {
      // No screenshots yet — show steps as a list
      lines.push('!!! note "Screenshots not yet captured"');
      lines.push('    Run the test suite to generate step-by-step screenshots.');
      lines.push('');
      for (const step of scenario.steps) {
        lines.push(`- **${step.keyword}** ${step.text}`);
      }
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

function generateIndex(features: ParsedFeature[]): string {
  const lines: string[] = [];

  lines.push('# Application User Manual');
  lines.push('');
  lines.push('This documentation is auto-generated from Gherkin feature specifications,');
  lines.push('Playwright test screenshots, and UI/UX wireframe prototypes. Each feature page');
  lines.push('shows the approved wireframe design alongside the living specification of how');
  lines.push('the application works.');
  lines.push('');

  // Design section
  if (fs.existsSync(UI_SPECS_DIR)) {
    lines.push('## Design');
    lines.push('');
    lines.push('The UI/UX design was approved in Phase 2 and grounds all feature implementations:');
    lines.push('');
    if (fs.existsSync(path.join(UI_SPECS_DIR, 'screen-map.md')))
      lines.push('- [**Screen Map**](design/screen-map.md) — all screens, navigation flows, and FRD mapping');
    if (fs.existsSync(path.join(UI_SPECS_DIR, 'design-system.md')))
      lines.push('- [**Design System**](design/design-system.md) — colors, typography, spacing, components');
    if (fs.existsSync(path.join(UI_SPECS_DIR, 'component-inventory.md')))
      lines.push('- [**Component Inventory**](design/components.md) — all UI components with props and states');
    if (fs.existsSync(path.join(UI_SPECS_DIR, 'walkthrough.html')))
      lines.push('- [**Interactive Walkthrough**](design/walkthrough.md) — replayable visual walkthrough of all user flows');
    if (fs.existsSync(path.join(UI_SPECS_DIR, 'prototypes', 'index.html')))
      lines.push('- [**Browse Prototypes**](design/prototypes/index.html) — interactive HTML wireframes');
    lines.push('');
  }

  lines.push('## Features');
  lines.push('');

  for (const f of features) {
    const scenarioCount = f.scenarios.length;
    const tagsStr = f.tags.length > 0 ? ` ${f.tags.join(' ')}` : '';
    lines.push(`- [**${f.name}**](features/${f.slug}.md) — ${scenarioCount} scenario${scenarioCount !== 1 ? 's' : ''}${tagsStr}`);
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('*Generated by spec2cloud. Re-run `npm run docs:generate` after test execution to update.*');

  return lines.join('\n');
}

function generateMkDocsNav(features: ParsedFeature[]): string {
  const lines: string[] = [];
  lines.push('nav:');
  lines.push('  - Home: index.md');

  // Design section (if UI specs exist)
  if (fs.existsSync(UI_SPECS_DIR)) {
    lines.push('  - Design:');
    if (fs.existsSync(path.join(UI_SPECS_DIR, 'screen-map.md')))
      lines.push('    - "Screen Map": design/screen-map.md');
    if (fs.existsSync(path.join(UI_SPECS_DIR, 'design-system.md')))
      lines.push('    - "Design System": design/design-system.md');
    if (fs.existsSync(path.join(UI_SPECS_DIR, 'component-inventory.md')))
      lines.push('    - "Component Inventory": design/components.md');
    if (fs.existsSync(path.join(UI_SPECS_DIR, 'walkthrough.html')))
      lines.push('    - "Walkthrough": design/walkthrough.md');
    if (fs.existsSync(path.join(UI_SPECS_DIR, 'flow-walkthrough.md')))
      lines.push('    - "Flow Details": design/flow-walkthrough.md');
  }

  lines.push('  - Features:');
  for (const f of features) {
    lines.push(`    - "${f.name}": features/${f.slug}.md`);
  }
  return lines.join('\n');
}

// ── Design Docs Generation ─────────────────────────────────────
function generateDesignDocs() {
  if (!fs.existsSync(UI_SPECS_DIR)) {
    console.log('   No specs/ui/ directory found. Skipping design docs.');
    return;
  }

  fs.mkdirSync(DESIGN_OUTPUT_DIR, { recursive: true });
  console.log('   Generating design documentation from UI/UX specs...');

  // Copy markdown specs directly (they're already well-formatted)
  const markdownFiles: { src: string; dest: string; label: string }[] = [
    { src: 'screen-map.md', dest: 'screen-map.md', label: 'Screen Map' },
    { src: 'design-system.md', dest: 'design-system.md', label: 'Design System' },
    { src: 'component-inventory.md', dest: 'components.md', label: 'Component Inventory' },
    { src: 'flow-walkthrough.md', dest: 'flow-walkthrough.md', label: 'Flow Walkthrough' },
  ];

  for (const { src, dest, label } of markdownFiles) {
    const srcPath = path.join(UI_SPECS_DIR, src);
    if (fs.existsSync(srcPath)) {
      const content = fs.readFileSync(srcPath, 'utf-8');
      // Prepend a breadcrumb back to design index
      const enriched = `> 📐 [Design](../index.md#design) / ${label}\n\n${content}`;
      fs.writeFileSync(path.join(DESIGN_OUTPUT_DIR, dest), enriched, 'utf-8');
      console.log(`   ✓ ${src} → design/${dest}`);
    }
  }

  // Generate walkthrough wrapper page (embeds walkthrough.html in an iframe)
  const walkthroughHtmlPath = path.join(UI_SPECS_DIR, 'walkthrough.html');
  if (fs.existsSync(walkthroughHtmlPath)) {
    const walkthroughMd = [
      '> 📐 [Design](../index.md#design) / Interactive Walkthrough',
      '',
      '# Interactive Walkthrough',
      '',
      'This walkthrough was generated during Phase 2 (UI/UX Design) and shows the approved',
      'user flows for every feature. Click through the steps to see the full journey.',
      '',
      '<iframe src="walkthrough.html" width="100%" height="700" style="border: 1px solid #ddd; border-radius: 8px; background: #fff;"></iframe>',
      '',
      '<small>[Open walkthrough in new tab](walkthrough.html){target="_blank"}</small>',
      '',
    ].join('\n');
    fs.writeFileSync(path.join(DESIGN_OUTPUT_DIR, 'walkthrough.md'), walkthroughMd, 'utf-8');
    // Copy the HTML file alongside it
    fs.copyFileSync(walkthroughHtmlPath, path.join(DESIGN_OUTPUT_DIR, 'walkthrough.html'));
    console.log('   ✓ walkthrough.html → design/walkthrough.md + design/walkthrough.html');
  }

  // Copy prototype HTML files into docs/design/prototypes/ (browsable from docs site)
  const prototypesDir = path.join(UI_SPECS_DIR, 'prototypes');
  if (fs.existsSync(prototypesDir)) {
    const destPrototypesDir = path.join(DESIGN_OUTPUT_DIR, 'prototypes');
    fs.mkdirSync(destPrototypesDir, { recursive: true });
    const protoFiles = fs.readdirSync(prototypesDir).filter(f => f.endsWith('.html'));
    for (const file of protoFiles) {
      fs.copyFileSync(path.join(prototypesDir, file), path.join(destPrototypesDir, file));
    }
    console.log(`   ✓ ${protoFiles.length} prototype(s) → design/prototypes/`);
  }
}

// ── Main ───────────────────────────────────────────────────────
function main() {
  console.log('📖 Generating documentation from Gherkin features and UI/UX specs...');
  console.log(`   Features dir:    ${FEATURES_DIR}`);
  console.log(`   Screenshots dir: ${SCREENSHOTS_DIR}`);
  console.log(`   UI specs dir:    ${UI_SPECS_DIR}`);
  console.log(`   Output dir:      ${OUTPUT_DIR}`);
  console.log('');

  // ── Design docs (from Phase 2 UI/UX specs) ──
  generateDesignDocs();
  console.log('');

  // ── Feature docs (from Gherkin + screenshots) ──
  // Ensure output dir exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Load screen map for wireframe→feature matching
  const screenMap = getScreenMapEntries();

  // Find all .feature files
  if (!fs.existsSync(FEATURES_DIR)) {
    console.log('   No specs/features/ directory found. Nothing to generate.');
    return;
  }

  const featureFiles = fs.readdirSync(FEATURES_DIR)
    .filter(f => f.endsWith('.feature'))
    .sort();

  if (featureFiles.length === 0) {
    console.log('   No .feature files found. Nothing to generate.');
    return;
  }

  console.log(`   Found ${featureFiles.length} feature file(s):`);

  const features: ParsedFeature[] = [];
  for (const file of featureFiles) {
    const filepath = path.join(FEATURES_DIR, file);
    const parsed = parseFeatureFile(filepath);
    if (parsed) {
      features.push(parsed);
      console.log(`   ✓ ${file} → ${parsed.scenarios.length} scenario(s)`);
    }
  }

  // Generate feature pages (with wireframe embeds)
  for (const feature of features) {
    const md = generateFeaturePage(feature, screenMap);
    const outPath = path.join(OUTPUT_DIR, `${feature.slug}.md`);
    fs.writeFileSync(outPath, md, 'utf-8');
  }

  // Generate index
  const indexMd = generateIndex(features);
  fs.writeFileSync(INDEX_FILE, indexMd, 'utf-8');

  // Generate nav partial
  const nav = generateMkDocsNav(features);
  fs.writeFileSync(path.join(ROOT, 'docs', 'nav.yml'), nav, 'utf-8');

  console.log('');
  console.log(`   ✅ Generated ${features.length} feature page(s)`);
  console.log(`   ✅ Updated docs/index.md`);
  console.log(`   ✅ Updated docs/nav.yml`);
  console.log('');
  console.log('   Run "npm run docs:serve" to preview the documentation site.');
}

main();
