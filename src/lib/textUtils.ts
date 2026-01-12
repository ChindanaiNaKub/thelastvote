// ============================================================================
// Text Utilities
// ============================================================================
// Helper functions for text processing and formatting.

// ----------------------------------------------------------------------------

/**
 * Strip markdown formatting from text
 * Removes bold, italic, code, and other markdown syntax
 */
export function stripMarkdown(text: string): string {
  return text
    // Remove bold (**text** or __text__)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    // Remove italic (*text* or _text_)
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // Remove code (`text` or ```text```)
    .replace(/```([\s\S]*?)```/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    // Remove strikethrough (~~text~~)
    .replace(/~~(.*?)~~/g, '$1')
    // Remove links [text](url) -> text
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    // Remove blockquotes (> text)
    .replace(/^>\s*/gm, '')
    // Remove horizontal rules (--- or ***)
    .replace(/^\s*[-*_]{3,}\s*$/gm, '')
    .trim()
}

/**
 * Truncate text to maximum length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 1) + '…'
}
