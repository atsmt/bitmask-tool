import type { ParseResult, StatusFlag } from "./types";

const ENTRY_PATTERN =
  /(?:^|,)\s*(?:(?:"((?:\\.|[^"\\])+)")|(?:'((?:\\.|[^'\\])+)')|([A-Za-z_$][\w$]*))\s*:\s*([+-]?(?:0[xX][\da-fA-F]+|0[bB][01]+|0[oO][0-7]+|\d+))\s*(?=,|$)/g;

export function parseStatusDictionary(rawInput: string): ParseResult {
  const trimmedInput = rawInput.trim();

  if (!trimmedInput) {
    return {
      statuses: [],
      error: null
    };
  }

  const cleanedInput = stripComments(trimmedInput);
  const objectLiteral = extractObjectLiteral(cleanedInput);

  if (!objectLiteral) {
    return {
      statuses: [],
      error: "No dictionary object was found. Paste JSON or a JS object literal."
    };
  }

  const objectBody = objectLiteral.slice(1, -1).trim();

  if (!objectBody) {
    return {
      statuses: [],
      error: "Dictionary is empty."
    };
  }

  const parsedResult = parseObjectEntries(objectBody);

  if (parsedResult.error) {
    return parsedResult;
  }

  return {
    statuses: parsedResult.statuses.sort(
      (a, b) => a.value - b.value || a.name.localeCompare(b.name)
    ),
    error: null
  };
}

function parseObjectEntries(objectBody: string): ParseResult {
  const statusesByName = new Map<string, StatusFlag>();
  let cursor = 0;
  let parsedEntries = 0;

  ENTRY_PATTERN.lastIndex = 0;

  for (const match of objectBody.matchAll(ENTRY_PATTERN)) {
    const fullMatch = match[0];
    const matchIndex = match.index ?? 0;
    const separatorText = objectBody.slice(cursor, matchIndex).trim();

    if (separatorText && separatorText !== ",") {
      return {
        statuses: [],
        error: `Unsupported syntax near \"${previewSyntax(separatorText)}\".`
      };
    }

    cursor = matchIndex + fullMatch.length;
    parsedEntries += 1;

    const doubleQuotedKey = match[1];
    const singleQuotedKey = match[2];
    const bareKey = match[3];
    const rawValue = match[4];

    const rawKey = doubleQuotedKey ?? singleQuotedKey ?? bareKey;

    if (!rawKey) {
      continue;
    }

    const normalizedKey = normalizeKey(
      rawKey,
      Boolean(doubleQuotedKey || singleQuotedKey)
    );

    if (!normalizedKey) {
      return {
        statuses: [],
        error: "Dictionary contains an empty key name."
      };
    }

    const numericValue = Number(rawValue);

    if (!Number.isFinite(numericValue) || !Number.isInteger(numericValue)) {
      return {
        statuses: [],
        error: `Value for \"${normalizedKey}\" must be an integer.`
      };
    }

    statusesByName.set(normalizedKey, {
      name: normalizedKey,
      value: numericValue
    });
  }

  const trailingText = objectBody.slice(cursor).trim();

  if (trailingText && trailingText !== ",") {
    return {
      statuses: [],
      error: `Unsupported syntax near \"${previewSyntax(trailingText)}\".`
    };
  }

  if (parsedEntries === 0 || statusesByName.size === 0) {
    return {
      statuses: [],
      error: "No valid key:number entries were found."
    };
  }

  return {
    statuses: [...statusesByName.values()],
    error: null
  };
}

function normalizeKey(key: string, wasQuoted: boolean): string {
  const cleanedKey = wasQuoted ? decodeEscapedKey(key) : key;
  return cleanedKey.trim();
}

function decodeEscapedKey(value: string): string {
  return value
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16))
    )
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16))
    )
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\(["'\\])/g, "$1");
}

function previewSyntax(input: string): string {
  return input.replace(/\s+/g, " ").slice(0, 24);
}

function extractObjectLiteral(input: string): string | null {
  let startIndex = -1;
  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplateString = false;
  let escaped = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\" && (inSingleQuote || inDoubleQuote || inTemplateString)) {
      escaped = true;
      continue;
    }

    if (inSingleQuote) {
      if (char === "'") {
        inSingleQuote = false;
      }
      continue;
    }

    if (inDoubleQuote) {
      if (char === '"') {
        inDoubleQuote = false;
      }
      continue;
    }

    if (inTemplateString) {
      if (char === "`") {
        inTemplateString = false;
      }
      continue;
    }

    if (char === "'") {
      inSingleQuote = true;
      continue;
    }

    if (char === '"') {
      inDoubleQuote = true;
      continue;
    }

    if (char === "`") {
      inTemplateString = true;
      continue;
    }

    if (char === "{") {
      if (depth === 0) {
        startIndex = index;
      }
      depth += 1;
      continue;
    }

    if (char === "}" && depth > 0) {
      depth -= 1;

      if (depth === 0 && startIndex >= 0) {
        return input.slice(startIndex, index + 1);
      }
    }
  }

  return null;
}

function stripComments(input: string): string {
  let result = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplateString = false;
  let inLineComment = false;
  let inBlockComment = false;
  let escaped = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const nextChar = input[index + 1];

    if (inLineComment) {
      if (char === "\n") {
        inLineComment = false;
        result += char;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === "*" && nextChar === "/") {
        inBlockComment = false;
        index += 1;
      }
      continue;
    }

    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }

    if (char === "\\" && (inSingleQuote || inDoubleQuote || inTemplateString)) {
      result += char;
      escaped = true;
      continue;
    }

    if (inSingleQuote) {
      if (char === "'") {
        inSingleQuote = false;
      }
      result += char;
      continue;
    }

    if (inDoubleQuote) {
      if (char === '"') {
        inDoubleQuote = false;
      }
      result += char;
      continue;
    }

    if (inTemplateString) {
      if (char === "`") {
        inTemplateString = false;
      }
      result += char;
      continue;
    }

    if (char === "/" && nextChar === "/") {
      inLineComment = true;
      index += 1;
      continue;
    }

    if (char === "/" && nextChar === "*") {
      inBlockComment = true;
      index += 1;
      continue;
    }

    if (char === "'") {
      inSingleQuote = true;
      result += char;
      continue;
    }

    if (char === '"') {
      inDoubleQuote = true;
      result += char;
      continue;
    }

    if (char === "`") {
      inTemplateString = true;
      result += char;
      continue;
    }

    result += char;
  }

  return result;
}
