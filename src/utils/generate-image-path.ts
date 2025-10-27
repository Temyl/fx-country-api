import path from "path";
import fs from "fs";

/**
 * Returns the cached summary image path if it exists.
 * If not found, returns null.
 */
export function getSummaryImagePath(): string | null {
    const filePath = path.resolve("cache", "summary.png");

    if (fs.existsSync(filePath)) {
        return filePath;
    }

  return null;
}