// One-off: rasterize scripts/og-card.svg → the 1200x630 share image (and the
// twitter copy). Run with sharp available: `node scripts/gen-og.mjs`
import sharp from "sharp";
import { readFileSync, copyFileSync } from "fs";

const svg = readFileSync("scripts/og-card.svg");
await sharp(svg, { density: 144 })
  .resize(1200, 630)
  .png()
  .toFile("app/opengraph-image.png");
copyFileSync("app/opengraph-image.png", "app/twitter-image.png");
console.log("wrote app/opengraph-image.png + app/twitter-image.png");
