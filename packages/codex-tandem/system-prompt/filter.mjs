// Filters <!--tag:name-->...<!--/tag--> blocks; the closer must repeat the opener's tag.
export function filterBlocks(text, keep) {
  return text.replace(
    /<!--([a-z]+):([a-z0-9]+)-->\r?\n?([\s\S]*?)<!--\/\1-->\r?\n?/g,
    (_marker, _tag, name, body) => (keep(name) ? body : ""),
  );
}

// Render-time check: keeping every block must consume every marker.
export function assertMarkersClosed(text, where) {
  if (/<!--[a-z]+:|<!--\/[a-z]+-->/.test(filterBlocks(text, () => true))) {
    throw new Error(`${where}: unbalanced markers`);
  }
}
