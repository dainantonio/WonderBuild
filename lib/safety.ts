const blockedWords = [
  "kill",
  "sex",
  "suicide",
  "nazi",
  "slur",
  "porn",
  "murder",
  "self harm"
];

const piiPatterns = [
  { key: "PII_EMAIL", regex: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi },
  { key: "PII_PHONE", regex: /\b(?:\+?\d{1,2}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b/g },
  { key: "PII_ADDRESS", regex: /\b\d{1,5}\s+[A-Za-z0-9\s]{2,30}\s(?:Street|St|Road|Rd|Avenue|Ave|Boulevard|Blvd|Lane|Ln)\b/gi }
];

const urlPattern = /(https?:\/\/|www\.)\S+/gi;

export function evaluateSafety(input: string) {
  let cleanedText = input;
  const flags = new Set<string>();

  for (const word of blockedWords) {
    const re = new RegExp(`\\b${word.replace(/\s+/g, "\\s+")}\\b`, "i");
    if (re.test(cleanedText)) {
      flags.add("BLOCKED_CONTENT");
    }
  }

  for (const pattern of piiPatterns) {
    if (pattern.regex.test(cleanedText)) {
      flags.add(pattern.key);
      cleanedText = cleanedText.replace(pattern.regex, "[redacted]");
    }
  }

  if (urlPattern.test(cleanedText)) {
    flags.add("EXTERNAL_URL");
    cleanedText = cleanedText.replace(urlPattern, "[link blocked]");
  }

  return {
    cleanedText,
    flags: Array.from(flags)
  };
}

export function ensureSafeObject(input: unknown): { sanitized: unknown; safetyFlags: string[] } {
  const flags = new Set<string>();

  const traverse = (value: unknown): unknown => {
    if (typeof value === "string") {
      const result = evaluateSafety(value);
      result.flags.forEach((flag) => flags.add(flag));
      return result.cleanedText;
    }

    if (Array.isArray(value)) {
      return value.map((item) => traverse(item));
    }

    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([key, child]) => [key, traverse(child)])
      );
    }

    return value;
  };

  return {
    sanitized: traverse(input),
    safetyFlags: Array.from(flags)
  };
}
