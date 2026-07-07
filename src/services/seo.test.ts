import { describe, it, expect } from 'vitest';
import { setPageMeta } from './seo';

describe('seo service', () => {
  it('should set document title', () => {
    setPageMeta('Test Title', 'Test Description');
    expect(document.title).toBe('Test Title');
  });

  it('should create OG meta tags', () => {
    setPageMeta('OG Test', 'OG Description');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    expect(ogTitle?.getAttribute('content')).toBe('OG Test');
    expect(ogDesc?.getAttribute('content')).toBe('OG Description');
  });

  it('should update existing meta tags', () => {
    setPageMeta('First', 'First desc');
    setPageMeta('Updated', 'Updated desc');
    expect(document.title).toBe('Updated');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    expect(ogTitle?.getAttribute('content')).toBe('Updated');
  });
});