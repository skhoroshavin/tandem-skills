import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import injectProjectContext from "./pi-tandem";

export default function (pi: ExtensionAPI) {
  injectProjectContext(pi);
}
