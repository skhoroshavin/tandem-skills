import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import injectProjectContext from "./pi-tandem";
import registerWebTools from "./web-tools";

export default function (pi: ExtensionAPI) {
  injectProjectContext(pi);
  registerWebTools(pi);
}
