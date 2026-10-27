// Helper to resolve a university logo URL.
// Resolves to a verified static icon, or initials for an unavailable school.
export function getLogoUrl(domain: string): string {
    return `/api/logo?domain=${encodeURIComponent(domain)}`;
}
