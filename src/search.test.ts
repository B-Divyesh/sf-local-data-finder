// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { filterLabel, highlightSnippet, sortResults } from "./search";

describe("search presentation", () => {
  it("highlights literal query terms without interpreting HTML", () => {
    const host = document.createElement("p");
    host.append(highlightSnippet("Found <script> in Project Aurora", "project"));
    expect(host.innerHTML).toBe("Found &lt;script&gt; in <mark>Project</mark> Aurora");
  });

  it("sorts by score and describes filters", () => {
    const base = { id: "1", title: "a", path: "/a", open_path: "/a", source_path: "/", kind: "text", snippet: "", extracted_at: "2026", modified_at: null };
    expect(sortResults([{ ...base, score: 1 }, { ...base, id: "2", score: 3 }])[0].id).toBe("2");
    expect(filterLabel({ kind: "mail", source: "/mail" })).toBe("mail · one source");
  });
});
