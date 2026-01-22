export function formatChatMarkdown(text: string): string {
  if (!text) return text;
  if (!/####|Considerations\s*-/.test(text)) return text;
  if (text.includes("```")) return text;

  let next = text.replace(/\r\n/g, "\n");

  next = next.replace(
    /(^|\n)Considerations\s*-\s+/g,
    "$1#### Considerations\n- "
  );
  next = next.replace(/(#{1,6}\s+[^\n#]+?)\s*-\s+/g, "$1\n- ");
  next = next.replace(/([^\n])-\s+/g, "$1\n- ");

  return next;
}
