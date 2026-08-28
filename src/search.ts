import type { SearchFilters, SearchResult } from "./types";

export const SUPPORTED_TYPES = ["all", "markdown", "text", "html", "mail", "pdf"] as const;

export function highlightSnippet(snippet: string, query: string): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const terms = query.trim().split(/\s+/).filter(Boolean).sort((a, b) => b.length - a.length);
  if (!terms.length) {
    fragment.append(snippet);
    return fragment;
  }
  const escaped = terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const matcher = new RegExp(`(${escaped.join("|")})`, "ig");
  for (const piece of snippet.split(matcher)) {
    if (terms.some((term) => term.toLocaleLowerCase() === piece.toLocaleLowerCase())) {
      const mark = document.createElement("mark");
      mark.textContent = piece;
      fragment.append(mark);
    } else fragment.append(piece);
  }
  return fragment;
}

export function filterLabel(filters: SearchFilters): string {
  const parts = [filters.kind && filters.kind !== "all" ? filters.kind : "", filters.source ? "one source" : ""].filter(Boolean);
  return parts.length ? parts.join(" · ") : "All indexed records";
}

export function sortResults(results: SearchResult[]): SearchResult[] {
  return [...results].sort((a, b) => b.score - a.score || b.extracted_at.localeCompare(a.extracted_at));
}
