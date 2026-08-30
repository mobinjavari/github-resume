const SAFE_EMOJI_IMG_PATTERN = /^<img(?:\s+[a-z-]+="[^"<>]*")*\s*\/?>$/i

/**
 * GitHub's status emojiHTML is expected to be a single `<img>` tag.
 * Rejects anything that doesn't match that exact shape before it reaches `v-html`.
 */
export function sanitizeEmojiHtml(html: string | undefined): string | undefined {
  if (!html || !SAFE_EMOJI_IMG_PATTERN.test(html)) return undefined
  if (/\bon[a-z]+\s*=/i.test(html) || /javascript:/i.test(html)) return undefined
  return html
}
