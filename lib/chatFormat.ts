export function formatChatMarkdown(text: string): string {
  if (!text) return text;

  let next = text.replace(/\r\n/g, "\n");

  // Rejoin orphaned closing punctuation that landed on its own line due to
  // stream token chunking.  e.g. "buying\n)" → "buying)"
  next = next.replace(/([^\n])\n([)\]}>,:;.!?])[ \t]*(?=\n|$)/g, "$1$2");

  // Heal stream-split words where a line ends mid-word (no trailing
  // punctuation/space) and the next line continues with lowercase letters.
  // e.g. "Conside\nr" → "Consider",  "Conside\nrations" → "Considerations"
  next = next.replace(
    /([A-Za-z]{2,})\n([a-z]+)(?=[\s\n.,;:!?)}\]"']|$)/g,
    "$1$2",
  );

  // Remove obvious streaming artifacts such as standalone punctuation lines.
  next = next.replace(/^\s*[:.]\s*$/gm, "");
  next = next.replace(/\n{3,}/g, "\n\n");

  // Keep raw code blocks intact.
  if (next.includes("```")) return next;
  if (!/#{2,4}\s|Considerations\s*-|Web context/i.test(next)) return next;

  next = next.replace(/Overview(?=[A-Z])/g, "Overview\n");
  next = next.replace(/([^\n])\s*(#{1,4}\s+)/g, "$1\n$2");
  next = next.replace(/((?:^|\n)#{1,4}\s+[^\n#]+)(?!\n)/g, "$1\n");

  next = next.replace(
    /(^|\n)\s*Web context\s*:\s*-\s+/gi,
    "$1#### Web context\n- "
  );
  next = next.replace(/([^\n])\s*(This is not financial advice\.)/gi, "$1\n\n$2");

  next = next.replace(
    /(^|\n)Considerations\s*-\s+/g,
    "$1#### Considerations\n- "
  );
  next = next.replace(/(#{1,6}\s+[^\n#]+?)\s*-\s+/g, "$1\n- ");

  return next;
}
