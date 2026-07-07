import { describe, it, expect } from 'vitest';
import { formatEuro } from './traiteurs';

describe('formatEuro', () => {
  it('should format whole numbers correctly', () => {
    const result = formatEuro(10);
    expect(result).toContain('10');
    expect(result).toContain('€');
    expect(result).not.toContain('NaN');
  });

  it('should format decimal numbers', () => {
    expect(formatEuro(10.5)).toContain('10,50');
    expect(formatEuro(3.99)).toContain('3,99');
    expect(formatEuro(0)).toContain('0');
  });
});