import { describe, it, expect } from 'vitest';
import { validateAndFixUrl } from '../lib/utils';

describe('validateAndFixUrl', () => {
    it('should return null for empty input', () => {
        expect(validateAndFixUrl('')).toBeNull();
    });

    it('should add https:// if missing', () => {
        expect(validateAndFixUrl('bookmyshow.com')).toBe('https://bookmyshow.com');
    });

    it('should preserve existing http and https', () => {
        expect(validateAndFixUrl('http://test.com')).toBe('http://test.com');
        expect(validateAndFixUrl('https://test.com')).toBe('https://test.com');
    });

    it('should trim whitespace', () => {
        expect(validateAndFixUrl('  https://test.com  ')).toBe('https://test.com');
    });

    it('should return null for invalid URLs', () => {
        expect(validateAndFixUrl('not-a-url')).toBeNull();
    });
});
