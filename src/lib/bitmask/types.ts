export interface StatusFlag {
  name: string;
  value: number;
}

export interface DictionaryProfile {
  id: string;
  name: string;
  text: string;
}

export interface ParseResult {
  statuses: StatusFlag[];
  error: string | null;
}
