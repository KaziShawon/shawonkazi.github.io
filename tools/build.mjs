#!/usr/bin/env node
// Static site generator. Zero dependencies - only Node built-ins.
// Reads content/, validates it, renders HTML via templates.mjs, writes dist/,
// copies assets/, and emits sitemap.xml + robots.txt + .nojekyll.
//
// Usage:
//   node tools/build.mjs           build the site into dist/
//   node tools/build.mjs --check   validate content and list PLACEHOLDER text, no build

import { readFile, writeFile, mkdir, rm, cp, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderMarkdown } from './markdown.mjs';
import { HomePage, ProjectsIndexPage, ProjectDetailPage, NotFoundPage } from './templates.mjs';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CONTENT_DIR = path.join(ROOT, 'content');
const ASSETS_DIR = path.join(ROOT, 'assets');
const DIST_DIR = path.join(ROOT, 'dist');

const CHECK_ONLY = process.argv.includes('--check');

/** Read and JSON.parse a content file, with a clear error on failure. */
async function readJson(relPath) {
  const full = path.join(CONTENT_DIR, relPath);
  let raw;
  try {
    raw = await readFile(full, 'utf8');
  } catch (err) {
    throw new Error(`Missing required content file: content/${relPath}`);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in content/${relPath}: ${err.message}`);
  }
}

/** Parse a project Markdown file: JSON frontmatter fenced by --- lines, then a Markdown body. */
function parseProjectFile(raw, filename) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) {
    throw new Error(`content/projects/${filename}: expected JSON frontmatter fenced by "---" lines.`);
  }
  const [, frontmatterRaw, body] = match;
  let frontmatter;
  try {
    frontmatter = JSON.parse(frontmatterRaw);
  } catch (err) {
    throw new Error(`content/projects/${filename}: invalid JSON frontmatter - ${err.message}`);
  }
  return { frontmatter, body };
}

const REQUIRED_PROJECT_FIELDS = ['title', 'summary', 'role', 'org', 'start', 'tags', 'stack', 'metrics'];

function validateProject(frontmatter, filename) {
  for (const field of REQUIRED_PROJECT_FIELDS) {
    if (frontmatter[field] === undefined) {
      throw new Error(`content/projects/${filename}: missing required field "${field}"`);
    }
  }
  if (!Array.isArray(frontmatter.tags) || frontmatter.tags.length === 0) {
    throw new Error(`content/projects/${filename}: "tags" must be a non-empty array`);
  }
  if (!Array.isArray(frontmatter.metrics)) {
    throw new Error(`content/projects/${filename}: "metrics" must be an array`);
  }
}

async function loadProjects() {
  const projectsDir = path.join(CONTENT_DIR, 'projects');
  let files;
  try {
    files = (await readdir(projectsDir)).filter((f) => f.endsWith('.md'));
  } catch {
    throw new Error('Missing required directory: content/projects/');
  }
  if (files.length === 0) {
    throw new Error('content/projects/ has no .md files - add at least one project.');
  }

  const projects = [];
  for (const filename of files) {
    const raw = await readFile(path.join(projectsDir, filename), 'utf8');
    const { frontmatter, body } = parseProjectFile(raw, filename);
    validateProject(frontmatter, filename);
    const slug = filename.replace(/\.md$/, '');
    projects.push({
      ...frontmatter,
      slug,
      end: frontmatter.end ?? null,
      order: frontmatter.order ?? 999,
      links: frontmatter.links ?? [],
      bodyHtml: renderMarkdown(body),
    });
  }
  return projects;
}

/** Recursively collect every text file under a directory, for the placeholder scan. */
async function collectTextFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectTextFiles(full)));
    } else if (/\.(md|json)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

async function scanPlaceholders() {
  const files = await collectTextFiles(CONTENT_DIR);
  const hits = [];
  for (const file of files) {
    const raw = await readFile(file, 'utf8');
    const lines = raw.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('PLACEHOLDER')) {
        hits.push({ file: path.relative(ROOT, file), line: idx + 1, text: line.trim() });
      }
    });
  }
  return hits;
}

async function writeFileEnsuringDir(filePath, content) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, 'utf8');
}

async function build() {
  const site = await readJson('site.json');
  const skills = await readJson('skills.json');
  const experience = await readJson('experience.json');
  const aboutRaw = await readFile(path.join(CONTENT_DIR, 'about.md'), 'utf8');
  const aboutHtml = renderMarkdown(aboutRaw);
  const projects = await loadProjects();

  if (CHECK_ONLY) {
    const placeholders = await scanPlaceholders();
    if (placeholders.length === 0) {
      console.log('No PLACEHOLDER content found. Site content is complete.');
    } else {
      console.log(`Found ${placeholders.length} PLACEHOLDER occurrence(s):\n`);
      for (const hit of placeholders) {
        console.log(`  ${hit.file}:${hit.line}  ${hit.text}`);
      }
    }
    return;
  }

  await rm(DIST_DIR, { recursive: true, force: true });
  await mkdir(DIST_DIR, { recursive: true });

  // Home page
  await writeFileEnsuringDir(
    path.join(DIST_DIR, 'index.html'),
    HomePage({ site, aboutHtml, projects, experience, skills })
  );

  // Projects index
  await writeFileEnsuringDir(
    path.join(DIST_DIR, 'projects', 'index.html'),
    ProjectsIndexPage({ site, projects })
  );

  // Project detail pages
  for (const project of projects) {
    await writeFileEnsuringDir(
      path.join(DIST_DIR, 'projects', project.slug, 'index.html'),
      ProjectDetailPage({ site, project, bodyHtml: project.bodyHtml })
    );
  }

  // 404 page
  await writeFileEnsuringDir(path.join(DIST_DIR, '404.html'), NotFoundPage({ site }));

  // Copy static assets verbatim
  await cp(ASSETS_DIR, path.join(DIST_DIR, 'assets'), { recursive: true });

  // sitemap.xml
  const routes = ['/', '/projects/', ...projects.map((p) => `/projects/${p.slug}/`)];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((r) => `  <url><loc>${site.siteUrl}${r}</loc></url>`).join('\n')}
</urlset>
`;
  await writeFileEnsuringDir(path.join(DIST_DIR, 'sitemap.xml'), sitemap);

  // robots.txt
  const robots = `User-agent: *\nAllow: /\nSitemap: ${site.siteUrl}/sitemap.xml\n`;
  await writeFileEnsuringDir(path.join(DIST_DIR, 'robots.txt'), robots);

  // .nojekyll - stops GitHub Pages from running the output through Jekyll,
  // which would otherwise ignore files/folders starting with an underscore.
  await writeFileEnsuringDir(path.join(DIST_DIR, '.nojekyll'), '');

  console.log(`Built ${routes.length} pages into dist/`);

  const placeholders = await scanPlaceholders();
  if (placeholders.length > 0) {
    console.log(`\nNote: ${placeholders.length} PLACEHOLDER occurrence(s) remain in content/.`);
    console.log('Run "node tools/build.mjs --check" to list them.');
  }
}

build().catch((err) => {
  console.error(`Build failed: ${err.message}`);
  process.exitCode = 1;
});
