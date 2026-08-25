// A small, purpose-built Markdown -> HTML subset parser.
//
// Supports exactly what a case-study or bio page needs: headings (##, ###),
// paragraphs, unordered/ordered lists, blockquotes, fenced code blocks,
// inline bold/italic/code, and links. Intentionally NOT a full CommonMark
// implementation - that would be a dependency. Keeping this file small and
// readable is the point of the zero-dependency approach documented in PLAN.md.

/**
 * Escape text for safe inclusion in HTML.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Render inline Markdown (bold, italic, code, links) within a line of text.
 * Escapes HTML first, then re-introduces the small set of supported tags.
 * @param {string} text
 * @returns {string}
 */
function renderInline(text) {
  let out = escapeHtml(text);

  // Inline code: `code`
  out = out.replace(/`([^`]+)`/g, (_, code) => `<code>${code}</code>`);

  // Links: [label](url)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    const external = /^https?:\/\//.test(url);
    const rel = external ? ' rel="noopener noreferrer" target="_blank"' : '';
    return `<a href="${url}"${rel}>${label}</a>`;
  });

  // Bold: **text**
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic: *text* (after bold, so **x** isn't mistaken for italic)
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  return out;
}

/**
 * Convert a Markdown document body to an HTML string.
 * @param {string} markdown
 * @returns {string}
 */
export function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const html = [];

  let i = 0;
  let paragraphBuffer = [];
  let listBuffer = null; // { type: 'ul' | 'ol', items: string[] }

  const flushParagraph = () => {
    if (paragraphBuffer.length) {
      html.push(`<p>${renderInline(paragraphBuffer.join(' '))}</p>`);
      paragraphBuffer = [];
    }
  };

  const flushList = () => {
    if (listBuffer) {
      const tag = listBuffer.type;
      const items = listBuffer.items.map((item) => `<li>${renderInline(item)}</li>`).join('');
      html.push(`<${tag}>${items}</${tag}>`);
      listBuffer = null;
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') {
      flushParagraph();
      flushList();
      i += 1;
      continue;
    }

    // Fenced code block
    if (trimmed.startsWith('```')) {
      flushParagraph();
      flushList();
      const codeLines = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1; // skip closing fence
      html.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
      continue;
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = headingMatch[1].length;
      html.push(`<h${level}>${renderInline(headingMatch[2])}</h${level}>`);
      i += 1;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushParagraph();
      flushList();
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2));
        i += 1;
      }
      html.push(`<blockquote><p>${renderInline(quoteLines.join(' '))}</p></blockquote>`);
      continue;
    }

    // Unordered list
    const ulMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      flushParagraph();
      if (!listBuffer || listBuffer.type !== 'ul') {
        flushList();
        listBuffer = { type: 'ul', items: [] };
      }
      listBuffer.items.push(ulMatch[1]);
      i += 1;
      continue;
    }

    // Ordered list
    const olMatch = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (olMatch) {
      flushParagraph();
      if (!listBuffer || listBuffer.type !== 'ol') {
        flushList();
        listBuffer = { type: 'ol', items: [] };
      }
      listBuffer.items.push(olMatch[1]);
      i += 1;
      continue;
    }

    // Regular paragraph text
    flushList();
    paragraphBuffer.push(trimmed);
    i += 1;
  }

  flushParagraph();
  flushList();

  return html.join('\n');
}
