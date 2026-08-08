export function sanitizeText(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) {
    return '';
  }
  try {
    new URL(trimmed);
    return trimmed;
  } catch {
    return '';
  }
}

export function sanitizeFileName(name: string): string {
  return name
    .replace(/[<>:"\/\\|?*\x00-\x1F]/g, '')
    .replace(/\.+/g, '.')
    .trim();
}