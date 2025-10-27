import { createCanvas, loadImage } from "canvas";
import { SummaryOptions } from "../internals/interface";
import path from "path";
import fs from "fs"

export async function generateSummaryImage({
  totalCountries,
  lastRefreshedAt,
  countries,
}: SummaryOptions): Promise<string> {
  const width = 900;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");


  ctx.fillStyle = "#f9fafb";
  ctx.fillRect(0, 0, width, height);


  ctx.fillStyle = "#111827";
  ctx.font = "bold 28px Arial";
  ctx.fillText("Country Summary Report", 30, 50);


  ctx.font = "20px Arial";
  ctx.fillText(`Total Countries: ${totalCountries}`, 30, 90);

  
  const top5 = [...countries]
    .filter((c) => c.estimated_gbp && c.estimated_gbp > 0)
    .sort((a, b) => (b.estimated_gbp ?? 0) - (a.estimated_gbp ?? 0))
    .slice(0, 5);

  ctx.fillText("Top 5 Countries by Estimated GDP:", 30, 130);
  ctx.font = "18px Arial";

  // Draw each top country (with optional flag)
  for (let i = 0; i < top5.length; i++) {
    const c = top5[i];
    const y = 160 + i * 50;

    ctx.fillText(
      `${i + 1}. ${c.name} (${c.currency_code ?? "N/A"}) — ${c.estimated_gbp?.toFixed(2) ?? "0"}`,
      80,
      y + 25
    );

    if (c.flag_url) {
      try {
        const img = await loadImage(c.flag_url);
        ctx.drawImage(img, 30, y, 40, 25);
      } catch {
        
      }
    }
  }

  
  ctx.font = "16px Arial";
  ctx.fillStyle = "#374151";
  ctx.fillText(
    `Last Refreshed: ${lastRefreshedAt.toISOString()}`,
    30,
    height - 30
  );

  
  const cacheDir = path.resolve("cache");
  fs.mkdirSync(cacheDir, { recursive: true });
  const filePath = path.join(cacheDir, "summary.png");
  fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

  console.log(`Summary image generated at ${filePath}`);
  return filePath;
}