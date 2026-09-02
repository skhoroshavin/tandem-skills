import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

// web_search (Brave Search API) for pi.

const BRAVE_API_KEY_ENV_VAR = "BRAVE_SEARCH_API_KEY";

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

async function braveSearch(query: string, apiKey: string, signal: AbortSignal | undefined): Promise<SearchResult[]> {
  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", query);
  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": apiKey,
    },
    signal,
  });
  if (!res.ok) {
    throw new Error(`Brave API error (${res.status}): ${await res.text()}`);
  }
  const raw = (await res.json()) as { web?: { results?: Array<{ title?: string; url?: string; description?: string }> } };
  return (raw.web?.results ?? []).map((r) => ({ title: r.title ?? "", url: r.url ?? "", snippet: r.description ?? "" }));
}

function formatSearchResults(query: string, results: SearchResult[]): string {
  const header = `**Search results for "${query}":**`;
  const list = results
    .map((r, i) => `${i + 1}. **${r.title}**\n   ${r.url}\n   ${r.snippet}`)
    .join("\n\n");
  return `${header}\n\n${list}`;
}

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: "web_search",
    label: "Web Search",
    description:
      "Search the web for information. Returns a list of results with titles, URLs, and snippets. Use when you need current information not in your training data.",
    parameters: Type.Object({
      query: Type.String({
        description: "The search query. Be specific and use natural language.",
      }),
    }),
    async execute(_toolCallId, params, signal, onUpdate) {
      const apiKey = process.env[BRAVE_API_KEY_ENV_VAR]?.trim();
      if (!apiKey) {
        throw new Error(`${BRAVE_API_KEY_ENV_VAR} is not set. Export it to enable web_search.`);
      }
      onUpdate?.({
        content: [{ type: "text", text: `Searching Brave for: "${params.query}"...` }],
        details: undefined,
      });
      const results = await braveSearch(params.query, apiKey, signal);
      if (results.length === 0) {
        return { content: [{ type: "text", text: `No results found for "${params.query}".` }], details: undefined };
      }
      return { content: [{ type: "text", text: formatSearchResults(params.query, results) }], details: undefined };
    },
  });
}
