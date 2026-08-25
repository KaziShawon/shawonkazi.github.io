// Page + component templates. Plain JavaScript template literals - no templating
// language to learn, no build step to compile them. See PLAN.md section 1 for the
// reasoning behind this approach.

import { escapeHtml } from './markdown.mjs';

/** Format a "YYYY-MM" string (or null) as "Mon YYYY" / "Present". */
function formatMonth(value) {
  if (!value) return 'Present';
  const [year, month] = value.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function icon(name) {
  const icons = {
    mail: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M2 5.5A1.5 1.5 0 0 1 3.5 4h17A1.5 1.5 0 0 1 22 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 18.5v-13Zm2.2.5 7.5 5.6a.5.5 0 0 0 .6 0L19.8 6H4.2ZM20 8.1l-6.9 5.2a2.5 2.5 0 0 1-3 0L4 8.1v10.4h16V8.1Z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M6.94 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM3.2 8.75h3.5V21H3.2V8.75ZM9.5 8.75H12.85v1.68h.05c.47-.87 1.6-1.79 3.3-1.79 3.53 0 4.18 2.32 4.18 5.35V21h-3.5v-6.35c0-1.51-.03-3.46-2.11-3.46-2.11 0-2.43 1.65-2.43 3.35V21H9.5V8.75Z"/></svg>',
    github: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.1.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>',
    external: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3Z M5 5h5v2H7v10h10v-3h2v5H5V5Z"/></svg>',
  };
  return icons[name] || '';
}

function Nav({ site }) {
  return `
<header class="site-header">
  <a class="skip-link" href="#main">Skip to content</a>
  <nav class="nav" aria-label="Primary">
    <a class="nav-brand" href="/">${escapeHtml(site.name)}</a>
    <button class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="nav-links">
      <span class="sr-only">Menu</span>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z"/></svg>
    </button>
    <div class="nav-links" id="nav-links">
      <a href="/#work">Work</a>
      <a href="/#experience">Experience</a>
      <a href="/#skills">Skills</a>
      <a href="/#contact">Contact</a>
      <a href="${site.resumeUrl}" class="nav-resume">R\u00e9sum\u00e9</a>
      <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode" type="button">
        <svg class="icon-sun" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 4V2m0 20v-2M4 12H2m20 0h-2M5.6 5.6 4.2 4.2m15.6 1.4 1.4-1.4M5.6 18.4l-1.4 1.4m15.6-1.4 1.4 1.4M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"/></svg>
        <svg class="icon-moon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M20.7 14.9A8.5 8.5 0 1 1 9.1 3.3a7 7 0 0 0 11.6 11.6Z"/></svg>
      </button>
    </div>
  </nav>
</header>`;
}

function Footer({ site }) {
  const year = new Date().getFullYear();
  return `
<footer class="site-footer">
  <p>&copy; ${year} ${escapeHtml(site.name)}. Built with a zero-dependency static site generator.</p>
  <div class="footer-social">
    ${site.social.map((s) => `<a href="${s.url}" aria-label="${escapeHtml(s.label)}">${icon(s.icon)}</a>`).join('')}
  </div>
</footer>`;
}

/** Shared HTML shell: head, nav, footer, theme script. */
export function BaseLayout({ site, title, description, path, ogImage, jsonLd, bodyClass = '' }, content) {
  const fullTitle = title ? `${title} \u2014 ${site.name}` : `${site.name} \u2014 ${site.role}`;
  const canonical = `${site.siteUrl}${path}`;
  const image = ogImage ? `${site.siteUrl}${ogImage}` : `${site.siteUrl}${site.ogImage}`;
  const desc = description || site.tagline;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(fullTitle)}</title>
<meta name="description" content="${escapeHtml(desc)}">
<link rel="canonical" href="${canonical}">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="stylesheet" href="/assets/styles.css">
<meta name="theme-color" content="${site.accent}">
${site.googleSiteVerification ? `<meta name="google-site-verification" content="${escapeHtml(site.googleSiteVerification)}">` : ''}

<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(fullTitle)}">
<meta property="og:description" content="${escapeHtml(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(fullTitle)}">
<meta name="twitter:description" content="${escapeHtml(desc)}">
<meta name="twitter:image" content="${image}">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
<script>
// Applied before paint to avoid a flash of the wrong theme.
(function () {
  var stored = localStorage.getItem('theme');
  var theme = stored || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();
</script>
</head>
<body class="${bodyClass}">
${Nav({ site })}
<main id="main">
${content}
</main>
${Footer({ site })}
<script src="/assets/main.js"></script>
</body>
</html>`;
}

function Hero({ site }) {
  return `
<section class="hero">
  <div class="hero-text">
    <p class="eyebrow">${escapeHtml(site.role)}</p>
    <h1>${escapeHtml(site.name)}</h1>
    <p class="hero-tagline">${escapeHtml(site.tagline)}</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="#work">View Work</a>
      <a class="btn btn-secondary" href="${site.resumeUrl}">Download R\u00e9sum\u00e9</a>
      <a class="btn btn-ghost" href="#contact">Get in Touch</a>
    </div>
  </div>
  <div class="hero-photo">
    <img src="${site.profileImage}" alt="Portrait of ${escapeHtml(site.name)}" width="220" height="220">
  </div>
</section>`;
}

function About({ aboutHtml }) {
  return `
<section class="about" id="about" aria-labelledby="about-heading">
  <h2 id="about-heading">About</h2>
  <div class="about-body">${aboutHtml}</div>
</section>`;
}

function ProjectCard(project) {
  const dates = `${formatMonth(project.start)} \u2013 ${formatMonth(project.end)}`;
  return `
<article class="project-card" data-tags="${project.tags.map((t) => t.toLowerCase()).join(',')}">
  <div class="project-card-head">
    <h3><a href="/projects/${project.slug}/">${escapeHtml(project.title)}</a></h3>
    <p class="project-dates">${dates}</p>
  </div>
  <p class="project-summary">${escapeHtml(project.summary)}</p>
  <ul class="project-metrics">
    ${project.metrics.map((m) => `<li><span class="metric-value">${escapeHtml(m.value)}</span><span class="metric-label">${escapeHtml(m.label)}</span></li>`).join('')}
  </ul>
  <ul class="project-tags">
    ${project.tags.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}
  </ul>
  <a class="project-card-link" href="/projects/${project.slug}/">Read case study ${icon('external')}</a>
</article>`;
}

function ProjectGrid({ projects, showFilter = true }) {
  const allTags = [...new Set(projects.flatMap((p) => p.tags))].sort();
  return `
<section class="work" id="work" aria-labelledby="work-heading">
  <h2 id="work-heading">Selected Work</h2>
  ${
    showFilter && allTags.length > 1
      ? `<div class="tag-filter" role="group" aria-label="Filter projects by tag">
    <button class="tag-chip is-active" data-tag="all" type="button">All</button>
    ${allTags.map((t) => `<button class="tag-chip" data-tag="${t.toLowerCase()}" type="button">${escapeHtml(t)}</button>`).join('')}
  </div>`
      : ''
  }
  <div class="project-grid">
    ${projects.map(ProjectCard).join('')}
  </div>
</section>`;
}

function ExperienceTimeline({ experience }) {
  return `
<section class="experience" id="experience" aria-labelledby="experience-heading">
  <h2 id="experience-heading">Experience</h2>
  <ol class="timeline">
    ${experience
      .map(
        (job) => `
    <li class="timeline-item">
      <div class="timeline-marker" aria-hidden="true"></div>
      <div class="timeline-content">
        <h3>${escapeHtml(job.role)}</h3>
        <p class="timeline-meta">${escapeHtml(job.company)} &middot; ${escapeHtml(job.location)} &middot; ${formatMonth(job.start)} \u2013 ${formatMonth(job.end)}</p>
        <ul class="timeline-highlights">
          ${job.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}
        </ul>
        <ul class="project-tags">
          ${job.tags.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}
        </ul>
      </div>
    </li>`
      )
      .join('')}
  </ol>
</section>`;
}

function SkillGroups({ skills }) {
  return `
<section class="skills" id="skills" aria-labelledby="skills-heading">
  <h2 id="skills-heading">Skills</h2>
  <div class="skill-groups">
    ${skills
      .map(
        (group) => `
    <div class="skill-group">
      <h3>${escapeHtml(group.category)}</h3>
      <ul class="skill-chips">
        ${group.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    </div>`
      )
      .join('')}
  </div>
</section>`;
}

function Contact({ site }) {
  return `
<section class="contact" id="contact" aria-labelledby="contact-heading">
  <h2 id="contact-heading">Contact</h2>
  <p>The fastest way to reach me is email. I'm also around on LinkedIn and GitHub.</p>
  <div class="contact-links">
    ${site.social.map((s) => `<a class="btn btn-secondary" href="${s.url}">${icon(s.icon)} ${escapeHtml(s.label)}</a>`).join('')}
    <a class="btn btn-ghost" href="${site.resumeUrl}">${icon('external')} R\u00e9sum\u00e9 (PDF)</a>
  </div>
</section>`;
}

export function HomePage({ site, aboutHtml, projects, experience, skills }) {
  const content = [
    Hero({ site }),
    About({ aboutHtml }),
    ProjectGrid({ projects: projects.filter((p) => p.featured).sort((a, b) => a.order - b.order) }),
    ExperienceTimeline({ experience }),
    SkillGroups({ skills }),
    Contact({ site }),
  ].join('\n');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    jobTitle: site.role,
    email: site.email,
    url: site.siteUrl,
    sameAs: site.social.filter((s) => s.url.startsWith('http')).map((s) => s.url),
  };

  return BaseLayout(
    { site, title: null, description: site.tagline, path: '/', jsonLd, bodyClass: 'page-home' },
    content
  );
}

export function ProjectsIndexPage({ site, projects }) {
  const sorted = [...projects].sort((a, b) => a.order - b.order);
  const content = `
<section class="page-header">
  <h1>Projects</h1>
  <p>A selection of the work I'm able to share publicly. Every case study covers the problem,
  the approach, and the measured result.</p>
</section>
${ProjectGrid({ projects: sorted })}`;

  return BaseLayout(
    { site, title: 'Projects', description: 'All projects and case studies.', path: '/projects/' },
    content
  );
}

export function ProjectDetailPage({ site, project, bodyHtml }) {
  const dates = `${formatMonth(project.start)} \u2013 ${formatMonth(project.end)}`;
  const content = `
<article class="project-detail">
  <a class="back-link" href="/projects/">&larr; All projects</a>
  <header class="project-detail-header">
    <p class="eyebrow">${escapeHtml(project.role)} &middot; ${escapeHtml(project.org)}</p>
    <h1>${escapeHtml(project.title)}</h1>
    <p class="project-dates">${dates}</p>
    <ul class="project-metrics">
      ${project.metrics.map((m) => `<li><span class="metric-value">${escapeHtml(m.value)}</span><span class="metric-label">${escapeHtml(m.label)}</span></li>`).join('')}
    </ul>
    <ul class="project-tags">
      ${project.stack.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}
    </ul>
  </header>
  <div class="project-detail-body">
    ${bodyHtml}
  </div>
  ${
    project.links?.length
      ? `<div class="project-detail-links">
    ${project.links.map((l) => `<a class="btn btn-secondary" href="${l.url}">${icon('external')} ${escapeHtml(l.label)}</a>`).join('')}
  </div>`
      : ''
  }
</article>`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.summary,
    author: { '@type': 'Person', name: site.name },
    datePublished: project.start,
  };

  return BaseLayout(
    { site, title: project.title, description: project.summary, path: `/projects/${project.slug}/`, jsonLd },
    content
  );
}

export function NotFoundPage({ site }) {
  const content = `
<section class="page-header not-found">
  <h1>404</h1>
  <p>That page doesn't exist. Head back to the <a href="/">homepage</a>.</p>
</section>`;
  return BaseLayout({ site, title: 'Page Not Found', description: 'Page not found.', path: '/404.html' }, content);
}

export { formatMonth };
