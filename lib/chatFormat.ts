export function formatChatMarkdown(text: string): string {
  if (!text) return text;
  if (!/#{2,4}\s|Considerations\s*-|Web context/i.test(text)) return text;
  if (text.includes("```")) return text;

  let next = text.replace(/\r\n/g, "\n");

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
