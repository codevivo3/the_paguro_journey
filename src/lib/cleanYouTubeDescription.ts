export function cleanYouTubeDescription(input: string, maxChars = 220) {
  const cleaned = input
    .replace(/https?:\/\/\S+/g, '') // remove urls
    .replace(/#[\p{L}\p{N}_]+/gu, '') // remove hashtags (unicode-safe)
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim();

  if (cleaned.length <= maxChars) return cleaned;
  return cleaned.slice(0, maxChars).trimEnd() + '…';
}
