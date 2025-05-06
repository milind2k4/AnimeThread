import { BaseAdapter } from "./base.js";

export class AnimeKAIAdapter extends BaseAdapter {
  get name() {
    return "animekai";
  }

  matches() {
    return window.location.host.includes("animekai.to");
  }

  extractMetadata() {
    // Initial simplified version
    return {
      englishTitle: document.title.split("|")[0].trim(),
      episode: parseInt(window.location.hash.match(/#ep=(\d+)/)?.[1]) || 1,
    };
  }
}
