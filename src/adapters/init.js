import { getActiveAdapter } from "../adapters";

export function init() {
  const adapter = getActiveAdapter();
  if (!adapter) return;

  console.log("Active adapter:", adapter.name);
  console.log("Metadata:", adapter.extractMetadata());
}

// Start
if (document.readyState === "complete") {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
