// One-off: rasterize extension/icon.svg into the PNG sizes Chrome needs.
// Run with sharp available: `node scripts/gen-icons.mjs`
import sharp from "sharp";
import { readFileSync, mkdirSync } from "fs";

const svg = readFileSync("extension/icon.svg");
mkdirSync("extension/icons", { recursive: true });

for (const size of [16, 32, 48, 128]) {
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(`extension/icons/icon${size}.png`);
  console.log(`wrote extension/icons/icon${size}.png`);
}
