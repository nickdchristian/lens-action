/**
 * Parses a multiline YAML-style string into a dictionary.
 * Supports delimiters: colon (`:`) or equals (`=`).
 * Ignores empty lines or lines without a delimiter.
 */
export function parseMultilineDictionary(
  input: string
): Record<string, string> {
  const result: Record<string, string> = {};
  if (!input) {
    return result;
  }

  const lines = input.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    const colonIndex = trimmed.indexOf(':');
    const equalsIndex = trimmed.indexOf('=');

    let delimiterIndex = -1;
    if (colonIndex !== -1 && equalsIndex !== -1) {
      delimiterIndex = Math.min(colonIndex, equalsIndex);
    } else if (colonIndex !== -1) {
      delimiterIndex = colonIndex;
    } else if (equalsIndex !== -1) {
      delimiterIndex = equalsIndex;
    }

    if (delimiterIndex !== -1) {
      const key = trimmed.substring(0, delimiterIndex).trim();
      const value = trimmed.substring(delimiterIndex + 1).trim();

      // Remove surrounding quotes if they exist and match
      const unquotedValue = value.replace(/^(['"])(.*)\1$/, '$2');
      result[key] = unquotedValue;
    }
  }

  return result;
}

/**
 * Converts a string-based dictionary to a numeric dictionary.
 * Values that cannot be parsed as floats are ignored.
 */
export function parseNumericDictionary(input: string): Record<string, number> {
  const stringDict = parseMultilineDictionary(input);
  const numericDict: Record<string, number> = {};

  for (const [key, value] of Object.entries(stringDict)) {
    const parsed = Number(value);
    if (!isNaN(parsed) && value.trim() !== '') {
      numericDict[key] = parsed;
    }
  }

  return numericDict;
}
