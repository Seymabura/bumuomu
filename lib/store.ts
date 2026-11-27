import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { SEED_QUIZZES } from "@/data/seed";
import { slugify } from "./game";
import type { ItemStats, PlayResult, Quiz, QuizInput, QuizSummary } from "./types";

/**
 * Depolama katmanı.
 * - DATABASE_URL varsa Postgres (Vercel'de Neon) kullanılır, tablolar ilk istekte kendiliğinden oluşur.
 * - Yoksa bellek içi depo kullanılır: yerelde denemek için yeterli, ama sunucu yeniden başlayınca
 *   kullanıcıların oluşturduğu quizler silinir. Canlıda mutlaka veritabanı bağlayın.
 */

export type SortKey = "populer" | "yeni";

export interface Store {
  list(opts: { sort: SortKey; mode?: string; q?: string; limit?: number }): Promise<QuizSummary[]>;
  get(slug: string): Promise<Quiz | null>;
  create(input: QuizInput): Promise<{ quiz: Quiz; editToken: string }>;
  update(slug: string, token: string, input: QuizInput): Promise<Quiz | "yetkisiz" | null>;
  remove(slug: string, token: string): Promise<boolean | "yetkisiz">;
  recordPlay(slug: string, result: PlayResult): Promise<void>;
}

const hash = (t: string) => createHash("sha256").update(t).digest("hex");
const newToken = () => randomBytes(18).toString("base64url");
const newId = () => randomBytes(6).toString("base64url");

function summarize(q: Quiz): QuizSummary {
  const firstImage = q.items.find((i) => i.image)?.image;
  return {
    id: q.id,
    slug: q.slug,
    mode: q.mode,
    title: q.title,
    description: q.description,
    author: q.author,
    cover: q.cover ?? firstImage,
    emojis: firstImage ? undefined : q.items.slice(0, 4).map((i) => i.emoji ?? "❔"),
    itemCount: q.items.length,
    plays: q.plays,
    createdAt: q.createdAt,
  };
}

/** Sonuçtan öğe başına istatistik artışlarını çıkarır. */
export function statDeltas(result: PlayResult): Map<string, ItemStats> {
  const d = new Map<string, ItemStats>();
  const get = (id: string) => {
    let s = d.get(id);
    if (!s) d.set(id, (s = { seen: 0, wins: 0, champs: 0 }));
    return s;
  };
  if (result.mode === "eleme") {
    for (const m of result.matches) {
      get(m.winner).seen++;
      get(m.winner).wins++;
      get(m.loser).seen++;
    }
    get(result.champion).champs++;
  } else {
    for (const a of result.answers) {
      get(a.itemId).seen++;
      if (a.correct) get(a.itemId).wins++;
    }
  }
  return d;
}

function matches(s: QuizSummary, mode?: string, q?: string) {
  if (mode && s.mode !== mode) return false;
  if (q) {
    const n = q.toLocaleLowerCase("tr");
    return (s.title + " " + s.description).toLocaleLowerCase("tr").includes(n);
  }
  return true;
}

// ---------- Bellek içi depo ----------

type MemRow = Quiz & { editHash: string };

function memoryStore(): Store {
  const g = globalThis as unknown as { __bumuomuMem?: Map<string, MemRow> };
  if (!g.__bumuomuMem) {
    g.__bumuomuMem = new Map();
    for (const s of SEED_QUIZZES) {
      g.__bumuomuMem.set(s.slug, { ...s, editHash: "" });
    }
  }
  const db = g.__bumuomuMem;
  const uniqueSlug = (title: string) => {
    const base = slugify(title);
    let slug = base;
    while (db.has(slug)) slug = `${base}-${newId().slice(0, 4).toLowerCase()}`;
    return slug;
  };

  return {
    async list({ sort, mode, q, limit = 60 }) {
      const all = [...db.values()].map(summarize).filter((s) => matches(s, mode, q));
      all.sort((a, b) => (sort === "populer" ? b.plays - a.plays : 0) || b.createdAt.localeCompare(a.createdAt));
      return all.slice(0, limit);
    },
    async get(slug) {
      const r = db.get(slug);
      if (!r) return null;
      const { editHash: _h, ...quiz } = r;
      return structuredClone(quiz);
    },
    async create(input) {
      const editToken = newToken();
      const quiz: Quiz = {
        ...input,
        id: newId(),
        slug: uniqueSlug(input.title),
        plays: 0,
        createdAt: new Date().toISOString(),
        stats: {},
      };
      db.set(quiz.slug, { ...quiz, editHash: hash(editToken) });
      return { quiz, editToken };
    },
    async update(slug, token, input) {
      const r = db.get(slug);
      if (!r) return null;
      if (!r.editHash || r.editHash !== hash(token)) return "yetkisiz";
      const next: MemRow = { ...r, ...input };
      db.set(slug, next);
      const { editHash: _h, ...quiz } = next;
      return quiz;
    },
    async remove(slug, token) {
      const r = db.get(slug);
      if (!r) return false;
      if (!r.editHash || r.editHash !== hash(token)) return "yetkisiz";
      db.delete(slug);
      return true;
    },
    async recordPlay(slug, result) {
      const r = db.get(slug);
      if (!r) return;
      r.plays++;
      for (const [id, d] of statDeltas(result)) {
        const s = (r.stats[id] ??= { seen: 0, wins: 0, champs: 0 });
        s.seen += d.seen;
        s.wins += d.wins;
        s.champs += d.champs;
      }
    },
  };
}

// ---------- Postgres (Neon) ----------

function postgresStore(url: string): Store {
  const sql = neon(url);
  let ready: Promise<void> | null = null;

  const init = () =>
    (ready ??= (async () => {
      await sql`CREATE TABLE IF NOT EXISTS quizzes (
        id text PRIMARY KEY,
        slug text UNIQUE NOT NULL,
        mode text NOT NULL,
        title text NOT NULL,
        description text NOT NULL DEFAULT '',
        author text NOT NULL DEFAULT 'Anonim',
        cover text,
        items jsonb NOT NULL,
        plays integer NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        edit_hash text NOT NULL DEFAULT ''
      )`;
      await sql`CREATE TABLE IF NOT EXISTS item_stats (
        quiz_id text NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        item_id text NOT NULL,
        seen integer NOT NULL DEFAULT 0,
        wins integer NOT NULL DEFAULT 0,
        champs integer NOT NULL DEFAULT 0,
        PRIMARY KEY (quiz_id, item_id)
      )`;
      await sql`CREATE INDEX IF NOT EXISTS quizzes_plays_idx ON quizzes (plays DESC)`;
      const [{ n }] = (await sql`SELECT count(*)::int AS n FROM quizzes`) as { n: number }[];
      if (n === 0) {
        for (const s of SEED_QUIZZES) {
          await sql`INSERT INTO quizzes (id, slug, mode, title, description, author, cover, items, plays, created_at)
            VALUES (${s.id}, ${s.slug}, ${s.mode}, ${s.title}, ${s.description}, ${s.author}, ${s.cover ?? null},
                    ${JSON.stringify(s.items)}::jsonb, ${s.plays}, ${s.createdAt})
            ON CONFLICT DO NOTHING`;
        }
      }
    })().catch((e) => {
      ready = null;
      throw e;
    }));

  const rowToQuiz = (r: any, stats: Record<string, ItemStats> = {}): Quiz => ({
    id: r.id,
    slug: r.slug,
    mode: r.mode,
    title: r.title,
    description: r.description,
    author: r.author,
    cover: r.cover ?? undefined,
    items: r.items,
    plays: r.plays,
    createdAt: new Date(r.created_at).toISOString(),
    stats,
  });

  return {
    async list({ sort, mode, q, limit = 60 }) {
      await init();
      const like = q ? `%${q}%` : null;
      const rows =
        sort === "populer"
          ? await sql`SELECT * FROM quizzes
              WHERE (${mode ?? null}::text IS NULL OR mode = ${mode ?? null})
                AND (${like}::text IS NULL OR title ILIKE ${like} OR description ILIKE ${like})
              ORDER BY plays DESC, created_at DESC LIMIT ${limit}`
          : await sql`SELECT * FROM quizzes
              WHERE (${mode ?? null}::text IS NULL OR mode = ${mode ?? null})
                AND (${like}::text IS NULL OR title ILIKE ${like} OR description ILIKE ${like})
              ORDER BY created_at DESC LIMIT ${limit}`;
      return rows.map((r) => summarize(rowToQuiz(r)));
    },
    async get(slug) {
      await init();
      const rows = await sql`SELECT * FROM quizzes WHERE slug = ${slug}`;
      if (!rows[0]) return null;
      const st = await sql`SELECT item_id, seen, wins, champs FROM item_stats WHERE quiz_id = ${rows[0].id}`;
      const stats: Record<string, ItemStats> = {};
      for (const s of st) stats[s.item_id] = { seen: s.seen, wins: s.wins, champs: s.champs };
      return rowToQuiz(rows[0], stats);
    },
    async create(input) {
      await init();
      const editToken = newToken();
      const id = newId();
      const base = slugify(input.title);
      for (let attempt = 0; attempt < 5; attempt++) {
        const slug = attempt === 0 ? base : `${base}-${newId().slice(0, 4).toLowerCase()}`;
        const rows = await sql`INSERT INTO quizzes (id, slug, mode, title, description, author, cover, items, edit_hash)
          VALUES (${id}, ${slug}, ${input.mode}, ${input.title}, ${input.description}, ${input.author},
                  ${input.cover ?? null}, ${JSON.stringify(input.items)}::jsonb, ${hash(editToken)})
          ON CONFLICT (slug) DO NOTHING RETURNING *`;
        if (rows[0]) return { quiz: rowToQuiz(rows[0]), editToken };
      }
      throw new Error("Benzersiz adres üretilemedi");
    },
    async update(slug, token, input) {
      await init();
      const rows = await sql`SELECT edit_hash FROM quizzes WHERE slug = ${slug}`;
      if (!rows[0]) return null;
      if (!rows[0].edit_hash || rows[0].edit_hash !== hash(token)) return "yetkisiz";
      await sql`UPDATE quizzes SET mode = ${input.mode}, title = ${input.title}, description = ${input.description},
        author = ${input.author}, cover = ${input.cover ?? null}, items = ${JSON.stringify(input.items)}::jsonb
        WHERE slug = ${slug}`;
      return this.get(slug);
    },
    async remove(slug, token) {
      await init();
      const rows = await sql`SELECT edit_hash FROM quizzes WHERE slug = ${slug}`;
      if (!rows[0]) return false;
      if (!rows[0].edit_hash || rows[0].edit_hash !== hash(token)) return "yetkisiz";
      await sql`DELETE FROM quizzes WHERE slug = ${slug}`;
      return true;
    },
    async recordPlay(slug, result) {
      await init();
      const rows = await sql`UPDATE quizzes SET plays = plays + 1 WHERE slug = ${slug} RETURNING id`;
      if (!rows[0]) return;
      const quizId = rows[0].id;
      for (const [itemId, d] of statDeltas(result)) {
        await sql`INSERT INTO item_stats (quiz_id, item_id, seen, wins, champs)
          VALUES (${quizId}, ${itemId}, ${d.seen}, ${d.wins}, ${d.champs})
          ON CONFLICT (quiz_id, item_id) DO UPDATE SET
            seen = item_stats.seen + EXCLUDED.seen,
            wins = item_stats.wins + EXCLUDED.wins,
            champs = item_stats.champs + EXCLUDED.champs`;
      }
    },
  };
}

let cached: Store | null = null;
export function getStore(): Store {
  if (!cached) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    cached = url ? postgresStore(url) : memoryStore();
  }
  return cached;
}

export const usingDatabase = () => Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
