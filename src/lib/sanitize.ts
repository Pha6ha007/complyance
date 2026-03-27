/**
 * Escape HTML special characters to prevent XSS in email templates.
 *
 * Converts & < > " ' to their HTML entity equivalents.
 * Use this on ALL user-supplied values before embedding in HTML email bodies.
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escape user input and convert newlines to <br> for HTML emails.
 */
export function escapeHtmlWithBreaks(unsafe: string): string {
  return escapeHtml(unsafe).replace(/\n/g, '<br>');
}
