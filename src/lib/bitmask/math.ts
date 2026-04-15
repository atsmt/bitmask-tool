import type { StatusFlag } from "./types";

export type BitmaskInputKind = "empty" | "decimal" | "binary" | "invalid";

export interface ParsedBitmaskInput {
  kind: BitmaskInputKind;
  value: number;
  normalizedValue: string;
}

export function toInteger(value: number | null | undefined): number {
  const normalized = Number(value);

  if (!Number.isFinite(normalized)) {
    return 0;
  }

  return Math.trunc(normalized);
}

export function parseBitmaskInput(rawValue: string): ParsedBitmaskInput {
  const normalizedValue = rawValue.trim().replace(/[\s_]+/g, "");

  if (!normalizedValue) {
    return {
      kind: "empty",
      value: 0,
      normalizedValue
    };
  }

  if (/^0[bB][01]+$/.test(normalizedValue)) {
    return {
      kind: "binary",
      value: Number.parseInt(normalizedValue.slice(2), 2),
      normalizedValue
    };
  }

  if (/^[01]+[bB]$/.test(normalizedValue)) {
    return {
      kind: "binary",
      value: Number.parseInt(normalizedValue.slice(0, -1), 2),
      normalizedValue
    };
  }

  if (/^[01]+$/.test(normalizedValue)) {
    return {
      kind: "binary",
      value: Number.parseInt(normalizedValue, 2),
      normalizedValue
    };
  }

  if (/^[+-]?\d+$/.test(normalizedValue)) {
    const decimalValue = Number(normalizedValue);

    if (!Number.isFinite(decimalValue)) {
      return {
        kind: "invalid",
        value: 0,
        normalizedValue
      };
    }

    return {
      kind: "decimal",
      value: Math.trunc(decimalValue),
      normalizedValue
    };
  }

  return {
    kind: "invalid",
    value: 0,
    normalizedValue
  };
}

export function isFlagActive(decimalValue: number, flagValue: number): boolean {
  const decimal = toInteger(decimalValue);
  const flag = toInteger(flagValue);

  if (flag === 0) {
    return false;
  }

  return (decimal & flag) === flag;
}

export function calculateFlagsDecimal(
  statuses: StatusFlag[],
  selectedNames: string[]
): number {
  if (selectedNames.length === 0) {
    return 0;
  }

  const selectedNameSet = new Set(selectedNames);

  return statuses.reduce((accumulatedValue, status) => {
    if (!selectedNameSet.has(status.name)) {
      return accumulatedValue;
    }

    return accumulatedValue | status.value;
  }, 0);
}
