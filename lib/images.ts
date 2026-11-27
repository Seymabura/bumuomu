import "server-only";
import { createHash } from "node:crypto";
import { neon } from "@neondatabase/serverless";

/**
 * Blob deposu bağlı değilken yüklenen görselleri Postgres'te saklar.
 * Kimlik içerikten türetilir (aynı görsel iki kez yüklenirse tek satır olur) ve
 * /api/img/<kimlik>.<uzantı> adresinden uzun süreli önbellekle sunulur.
 */

const url = () => process.env.DATABASE_URL || process.env.POSTGRES_URL;
let ready: Promise<void> | null = null;

function db() {
  const u = url();
  if (!u) return null;
  const sql = neon(u);
  ready ??= sql`CREATE TABLE IF NOT EXISTS images (
      id text PRIMARY KEY,
      type text NOT NULL,
      data bytea NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`
    .then(() => undefined)
    .catch((e) => {
      ready = null;
      throw e;
    });
  return { sql, ready };
}

export const canStoreImages = () => Boolean(url());

export async function saveImage(bytes: Buffer, type: string): Promise<string | null> {
  const d = db();
  if (!d) return null;
  await d.ready;
  const id = createHash("sha256").update(bytes).digest("hex").slice(0, 24);
  await d.sql`INSERT INTO images (id, type, data) VALUES (${id}, ${type}, decode(${bytes.toString("base64")}, 'base64'))
    ON CONFLICT (id) DO NOTHING`;
  const ext = type.split("/")[1].replace("jpeg", "jpg");
  return `/api/img/${id}.${ext}`;
}

export async function loadImage(id: string): Promise<{ type: string; bytes: Buffer } | null> {
  const d = db();
  if (!d || !/^[a-f0-9]{24}$/.test(id)) return null;
  await d.ready;
  const rows = await d.sql`SELECT type, encode(data, 'base64') AS b64 FROM images WHERE id = ${id}`;
  if (!rows[0]) return null;
  return { type: rows[0].type, bytes: Buffer.from(rows[0].b64, "base64") };
}
