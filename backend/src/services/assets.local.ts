import { mkdir, readFile, writeFile } from "fs/promises";
import { join, resolve } from "path";
import { Readable } from "stream";

// Directory to store assets locally on the filesystem
const DIR = resolve("./.assets");

/**
 * Store an asset to the local filesystem
 * @param id - Unique identifier for the asset
 * @param stream - The file data as a Readable stream or Buffer
 */
export async function storeAsset(id: string, stream: Readable | Buffer) {
  // Ensure the assets directory exists
  await mkdir(DIR, { recursive: true });
  
  // Write the file to the assets directory
  await writeFile(join(DIR, id), stream);
}

/**
 * Load an asset from the local filesystem
 * @param id - Unique identifier for the asset
 * @returns Buffer containing the file data
 */
export async function loadAsset(id: string) {
  return readFile(join(DIR, id));
} 