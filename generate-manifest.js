import { readFileSync, writeFileSync } from 'fs';

const supportedSites = JSON.parse(readFileSync('supportedSites.json', 'utf-8'));

const manifest = {
  manifest_version: 2,

  name: "AniReddit",

  version: "1.0",

  description: "Displays Reddit r/anime comments on anime episode pages.",

  icons: {
    "48": "icons/icon48.png"
  },

  permissions: [
    "activeTab",
    "https://www.reddit.com/*"
  ],

  content_scripts: [
    {
      matches: supportedSites,
      js: ["content.js"],
      css: ["style.css"]
    }
  ],
  browser_action: {
    default_icon: "icons/icon48.png",
    default_title: "AniReddit"
  }
};

writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));
console.log("✅ manifest.json generated successfully!");
