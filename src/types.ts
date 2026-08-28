export type Source = {
  path: string;
  document_count: number;
  last_indexed: string | null;
  errors: string[];
};

export type Status = {
  sources: Source[];
  document_count: number;
  locked: boolean;
  encrypted: boolean;
  last_indexed: string | null;
};

export type SearchResult = {
  id: string;
  title: string;
  path: string;
  source_path: string;
  kind: string;
  snippet: string;
  extracted_at: string;
  modified_at: string | null;
  score: number;
};

export type SearchFilters = { kind?: string; source?: string };
