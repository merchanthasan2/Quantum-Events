export function validateAndFixUrl(url: string): string | null {
    if (!url) return null;

    let fixedUrl = url.trim();

    // Basic validation to see if it even looks like a URL
    if (fixedUrl.length < 4) return null;

    // Ensure it has a protocol
    if (!/^https?:\/\//i.test(fixedUrl)) {
        fixedUrl = 'https://' + fixedUrl;
    }

    try {
        const parsed = new URL(fixedUrl);
        // Ensure there is at least one dot in the hostname for it to be a valid web URL
        if (!parsed.hostname.includes('.')) return null;
        return fixedUrl;
    } catch (e) {
        return null;
    }
}
