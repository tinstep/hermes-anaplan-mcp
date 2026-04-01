export function withNextSteps(
  result: { content: Array<{ type: "text"; text: string }> },
  hints: string[]
): { content: Array<{ type: "text"; text: string }> } {
  if (hints.length === 0) return result;
  const hintText = hints.map((h) => `- ${h}`).join("\n");
  return {
    content: [...result.content, { type: "text" as const, text: `\n**Next steps:**\n${hintText}` }],
  };
}
