import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { formatSize, type TruncationResult, truncateHead } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

// web_search (Brave Search API) and web_fetch (generic HTTP reader) for pi.

const MIN_SEARCH_RESULTS = 1;
const MAX_SEARCH_RESULTS = 10;
const DEFAULT_SEARCH_RESULTS = 5;
const BRAVE_API_KEY_ENV_VAR = "BRAVE_SEARCH_API_KEY";

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

function refusePrivateHost(hostname: string): never {
  throw new Error(`Refusing to fetch private/loopback address: ${hostname}`);
}

// Rejects anything that is not a public http(s) endpoint: no non-HTTP schemes,
// and hostnames that point at loopback, RFC1918, link-local (incl. cloud
// metadata) or IPv6 local addresses. Literal hostnames only - no DNS lookup.
function assertPublicHttpUrl(raw: string): void {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`Invalid URL: ${raw}`);
  }
  if (!/^https?:$/.test(url.protocol)) {
    throw new Error(`Unsupported URL protocol: ${url.protocol}. Only http and https are supported.`);
  }

  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host.includes(":")) {
    // IPv6 literal (DNS names never contain ":"); ::ffff:* are IPv4-mapped
    // forms whose dotted target is hidden by URL canonicalization.
    if (
      host === "::" ||
      host === "::1" ||
      host.startsWith("fe80:") ||
      host.startsWith("fc") ||
      host.startsWith("fd") ||
      host.startsWith("::ffff:")
    ) {
      refusePrivateHost(url.hostname);
    }
  } else {
    const v4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (v4) {
      const [a, b] = [Number(v4[1]), Number(v4[2])];
      const reserved =
        a === 0 || // unspecified
        a === 10 || // RFC1918
        a === 127 || // loopback
        (a === 169 && b === 254) || // link-local, incl. cloud metadata
        (a === 172 && b >= 16 && b <= 31) || // RFC1918
        (a === 192 && b === 168); // RFC1918
      if (reserved) refusePrivateHost(url.hostname);
    }
  }
}

const OMITTED_ELEMENTS_REGEX = /<(script|style|noscript)\b[\s\S]*?<\/\1>/gi;
const BLOCK_BREAK_REGEX =
  /<\/(p|div|h[1-6]|li|tr|blockquote|pre|section|article|header|footer|nav|details|summary)>|<br\s*\/?>/gi;
const ANY_TAG_REGEX = /<[^>]+>/g;
const TITLE_TAG_REGEX = /<title[^>]*>([\s\S]*?)<\/title>/i;

function htmlToText(html: string): string {
  let text = html.replace(OMITTED_ELEMENTS_REGEX, "").replace(BLOCK_BREAK_REGEX, "\n");
  text = text.replace(ANY_TAG_REGEX, " ");
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
  return text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function pageTitle(html: string): string | undefined {
  return html.match(TITLE_TAG_REGEX)?.[1].replace(ANY_TAG_REGEX, "").trim() || undefined;
}

async function braveSearch(
  query: string,
  maxResults: number,
  apiKey: string,
  signal: AbortSignal | undefined,
): Promise<SearchResult[]> {
  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", String(maxResults));
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

async function readPage(url: string, raw: boolean, signal: AbortSignal | undefined): Promise<{ text: string; title?: string; contentType?: string }> {
  const res = await fetch(url, {
    signal,
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; tandem-pi/1.0)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5",
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  }
  const contentType = res.headers.get("content-type") ?? "";
  if (/^(image|video|audio)\//.test(contentType)) {
    throw new Error(`Unsupported content type: ${contentType}. web_fetch supports text pages only.`);
  }
  const rawBody = await res.text();
  const pageContentType = contentType || undefined;
  if (!raw && /text\/html/.test(contentType)) {
    return { text: htmlToText(rawBody), title: pageTitle(rawBody), contentType: pageContentType };
  }
  return { text: rawBody, contentType: pageContentType };
}

async function writeTempCopy(content: string): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "tandem-fetch-"));
  const file = join(dir, "content.txt");
  await writeFile(file, content, "utf8");
  return file;
}

function formatTruncationNote(truncation: TruncationResult, tempFile: string): string {
  const omittedLines = truncation.totalLines - truncation.outputLines;
  const omittedBytes = truncation.totalBytes - truncation.outputBytes;
  return (
    `\n\n[Content truncated: showing ${truncation.outputLines} of ${truncation.totalLines} lines` +
    ` (${formatSize(truncation.outputBytes)} of ${formatSize(truncation.totalBytes)}).` +
    ` ${omittedLines} lines (${formatSize(omittedBytes)}) omitted.` +
    ` Full content saved to: ${tempFile}]`
  );
}

function formatSearchResults(query: string, results: SearchResult[]): string {
  const header = `**Search results for "${query}":**`;
  const list = results
    .map((r, i) => `${i + 1}. **${r.title}**\n   ${r.url}\n   ${r.snippet}`)
    .join("\n\n");
  return `${header}\n\n${list}`;
}

function formatPageHeader(url: string, title: string | undefined, contentType: string): string {
  const lines = [`**Fetched:** ${url}`];
  if (title) lines.push(`**Title:** ${title}`);
  if (contentType) lines.push(`**Content-Type:** ${contentType}`);
  return `${lines.join("\n")}\n\n`;
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
      max_results: Type.Optional(
        Type.Number({
          description: `Maximum number of results to return (${MIN_SEARCH_RESULTS}-${MAX_SEARCH_RESULTS}). Default: ${DEFAULT_SEARCH_RESULTS}.`,
          default: DEFAULT_SEARCH_RESULTS,
          minimum: MIN_SEARCH_RESULTS,
          maximum: MAX_SEARCH_RESULTS,
        }),
      ),
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
      const maxResults = Math.min(
        Math.max(params.max_results ?? DEFAULT_SEARCH_RESULTS, MIN_SEARCH_RESULTS),
        MAX_SEARCH_RESULTS,
      );
      const results = await braveSearch(params.query, maxResults, apiKey, signal);
      if (results.length === 0) {
        return { content: [{ type: "text", text: `No results found for "${params.query}".` }], details: undefined };
      }
      return { content: [{ type: "text", text: formatSearchResults(params.query, results) }], details: undefined };
    },
  });

  pi.registerTool({
    name: "web_fetch",
    label: "Web Fetch",
    description:
      "Fetch the content of a specific URL. Returns text content for HTML pages (tags stripped), raw text for plain text or JSON. Supports http and https only. Content is truncated to avoid overwhelming the context window.",
    parameters: Type.Object({
      url: Type.String({
        description: "The URL to fetch. Must be http or https.",
      }),
      raw: Type.Optional(
        Type.Boolean({
          description: "If true, return the raw HTML instead of extracted text. Default: false.",
          default: false,
        }),
      ),
    }),
    async execute(_toolCallId, params, signal, onUpdate) {
      const { url, raw = false } = params;
      assertPublicHttpUrl(url);
      onUpdate?.({ content: [{ type: "text", text: `Fetching: ${url}...` }], details: undefined });
      const { text: pageText, title, contentType } = await readPage(url, raw, signal);
      const truncation = truncateHead(pageText);
      let output = truncation.content;
      if (truncation.truncated) {
        output += formatTruncationNote(truncation, await writeTempCopy(pageText));
      }
      return {
        content: [{ type: "text", text: formatPageHeader(url, title, contentType ?? "") + output }],
        details: undefined,
      };
    },
  });
}
