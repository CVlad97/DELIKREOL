import { describe, it, expect } from 'vitest';
import { validateMartiniquePhone, PHONE_ERROR_MESSAGE } from './phone';

describe('phone validation', () => {
  it('should accept 0696 format', () => {
    expect(validateMartiniquePhone('0696123456')).toBe(true);
    expect(validateMartiniquePhone('0696 12 34 56')).toBe(true);
    expect(validateMartiniquePhone('0696 98 76 54')).toBe(true);
  });

  it('should accept 0697 format', () => {
    expect(validateMartiniquePhone('0697 98 76 54')).toBe(true);
    expect(validateMartiniquePhone('0697123456')).toBe(true);
  });

  it('should accept +596 format', () => {
    expect(validateMartiniquePhone('+596696123456')).toBe(true);
    expect(validateMartiniquePhone('+596 696 12 34 56')).toBe(true);
  });

  it('should reject invalid numbers', () => {
    expect(validateMartiniquePhone('')).toBe(false);
    expect(validateMartiniquePhone('123')).toBe(false);
    expect(validateMartiniquePhone('0123456789')).toBe(false);
    expect(validateMartiniquePhone('abcdefghij')).toBe(false);
    expect(validateMartiniquePhone('0695 12 34 56')).toBe(false);
  });

  it('should export error message', () => {
    expect(PHONE_ERROR_MESSAGE).toContain('0696');
  });
});