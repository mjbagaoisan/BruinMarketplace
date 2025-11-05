import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

export type Listing = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const LISTINGS_FILE = path.join(DATA_DIR, "listings.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

type SaveListingInput = {
  title: string;
  description: string;
  imageBuffer: Buffer;
  imageExtension: string;
};

async function ensureStorageReady() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });

  try {
    await fs.access(LISTINGS_FILE);
  } catch {
    await fs.writeFile(LISTINGS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

async function readListings(): Promise<Listing[]> {
  await ensureStorageReady();

  const raw = await fs.readFile(LISTINGS_FILE, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as Listing[];
    }
  } catch (error) {
    console.error("Failed to parse listings file", error);
  }

  return [];
}

export async function getListings(): Promise<Listing[]> {
  return readListings();
}

export async function addListing({
  title,
  description,
  imageBuffer,
  imageExtension,
}: SaveListingInput): Promise<Listing> {
  const listings = await readListings();
  const id = randomUUID();
  const filename = `${id}.${imageExtension}`;
  const imagePath = path.join(UPLOADS_DIR, filename);

  await fs.writeFile(imagePath, imageBuffer);

  const newListing: Listing = {
    id,
    title,
    description,
    imageUrl: `/uploads/${filename}`,
    createdAt: new Date().toISOString(),
  };

  const updatedListings = [newListing, ...listings];
  await fs.writeFile(
    LISTINGS_FILE,
    JSON.stringify(updatedListings, null, 2),
    "utf-8",
  );

  return newListing;
}
