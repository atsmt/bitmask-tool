export interface StatusFlag {
  name: string;
  value: number;
}

export interface ParseResult {
  statuses: StatusFlag[];
  error: string | null;
}
