import { parseMultilineDictionary, parseNumericDictionary } from '../src/utils';

describe('Utils', () => {
  describe('parseMultilineDictionary', () => {
    it('should parse key-value pairs with colons', () => {
      const input = `
        env: production
        team: backend
      `;
      const result = parseMultilineDictionary(input);
      expect(result).toEqual({ env: 'production', team: 'backend' });
    });

    it('should parse key-value pairs with equals', () => {
      const input = `
        env=staging
        team=frontend
      `;
      const result = parseMultilineDictionary(input);
      expect(result).toEqual({ env: 'staging', team: 'frontend' });
    });

    it('should strip quotes from values only if they match', () => {
      const input = `
        env: "production"
        team: 'backend'
        mismatched: "frontend'
        mismatched2: 'hello"
      `;
      const result = parseMultilineDictionary(input);
      expect(result).toEqual({ 
        env: 'production', 
        team: 'backend',
        mismatched: '"frontend\'',
        mismatched2: '\'hello"'
      });
    });

    it('should handle empty strings', () => {
      expect(parseMultilineDictionary('')).toEqual({});
      expect(parseMultilineDictionary('   \n  ')).toEqual({});
    });
  });

  describe('parseNumericDictionary', () => {
    it('should parse numeric values correctly', () => {
      const input = `
        build_time: 42.5
        bundle_size_mb: 1.2
      `;
      const result = parseNumericDictionary(input);
      expect(result).toEqual({ build_time: 42.5, bundle_size_mb: 1.2 });
    });

    it('should ignore non-numeric values strictly', () => {
      const input = `
        build_time: 42.5
        version: 1.0.0
        empty: ""
        text: abc
      `;
      const result = parseNumericDictionary(input);
      expect(result).toEqual({ build_time: 42.5 });
    });
  });
});
