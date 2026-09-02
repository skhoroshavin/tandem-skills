import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import injectProjectContext from "./pi-tandem";
import registerWebSearch from "./web-search";

export default function (pi: ExtensionAPI) {
  injectProjectContext(pi);
  registerWebSearch(pi);
}
