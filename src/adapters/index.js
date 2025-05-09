import { AnimeKAIAdapter } from "./animekai";

const ADAPTERS = [new AnimeKAIAdapter()];

export function getActiveAdapter() {
  return ADAPTERS.find((adapter) => adapter.matches());
}
