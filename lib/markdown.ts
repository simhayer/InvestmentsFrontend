const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const escapeAttribute = (value: string) =>
  escapeHtml(value).replace(/`/g, "&#96;");

export function renderMarkdown(input: string): string {
  if (!input) return "";

  const codeBlocks: string[] = [];
  let text = input.replace(/```([^\n]*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const language = String(lang || "").trim();
    const className = language ? ` class="language-${escapeAttribute(language)}"` : "";
    const html = `<pre><code${className}>${escapeHtml(code)}</code></pre>`;
    codeBlocks.push(html);
    return `%%CODEBLOCK_${codeBlocks.length - 1}%%`;
  });

  text = escapeHtml(text);

  text = text.replace(/`([^`]+)`/g, (_match, code) => `<code>${code}</code>`);
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  text = text.replace(/_([^_]+)_/g, "<em>$1</em>");
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
    const safeUrl = escapeAttribute(url);
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });

  const lines = text.split(/\r?\n/);
  let html = "";
  let inUl = false;
  let inOl = false;
  const isTableSeparator = (line: string) =>
    /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?\s*$/.test(line);
  const splitTableRow = (line: string) =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());

  const closeLists = () => {
    if (inUl) {
      html += "</ul>";
      inUl = false;
    }
    if (inOl) {
      html += "</ol>";
      inOl = false;
    }
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();
    const codeMatch = trimmed.match(/^%%CODEBLOCK_(\d+)%%$/);
    if (codeMatch) {
      closeLists();
      html += trimmed;
      continue;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      closeLists();
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      html += `<h${level}>${content}</h${level}>`;
      continue;
    }

    if (trimmed.startsWith("> ")) {
      closeLists();
      html += `<blockquote>${trimmed.replace(/^>\s+/, "")}</blockquote>`;
      continue;
    }

    if (/^\s*-\s+/.test(line)) {
      if (!inUl) {
        closeLists();
        html += "<ul>";
        inUl = true;
      }
      html += `<li>${line.replace(/^\s*-\s+/, "")}</li>`;
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      if (!inOl) {
        closeLists();
        html += "<ol>";
        inOl = true;
      }
      html += `<li>${line.replace(/^\s*\d+\.\s+/, "")}</li>`;
      continue;
    }

    // GitHub-style pipe table:
    // | Col A | Col B |
    // | --- | --- |
    // | v1 | v2 |
    if (line.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      closeLists();
      const headers = splitTableRow(line);
      const colCount = headers.length;
      const rows: string[][] = [];
      i += 2; // Skip header and separator
      while (i < lines.length) {
        const rowLine = lines[i];
        const rowTrimmed = rowLine.trim();
        if (!rowTrimmed || !rowLine.includes("|")) break;
        if (isTableSeparator(rowLine)) {
          i += 1;
          continue;
        }
        const cells = splitTableRow(rowLine);
        rows.push(cells.slice(0, colCount));
        i += 1;
      }
      i -= 1; // account for outer loop increment

      const headerHtml = headers.map((cell) => `<th>${cell}</th>`).join("");
      const bodyHtml = rows
        .map((row) => {
          const padded = [...row];
          while (padded.length < colCount) padded.push("");
          return `<tr>${padded.map((cell) => `<td>${cell}</td>`).join("")}</tr>`;
        })
        .join("");
      html += `<div class="md-table-wrap"><table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`;
      continue;
    }

    if (!trimmed) {
      closeLists();
      continue;
    }

    closeLists();
    html += `<p>${trimmed}</p>`;
  }

  closeLists();

  html = html.replace(/%%CODEBLOCK_(\d+)%%/g, (_match, index) => {
    const block = codeBlocks[Number(index)];
    return block || "";
  });

  return html;
}
