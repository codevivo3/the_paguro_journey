/**
 * scripts/seed-world-regions.ts
 *
 * Seeds "World Bank World Regions" into Sanity and can optionally:
 *  - attach a map image to each region (seeded PNG assets)
 *  - auto-attach the worldRegion reference onto each country doc
 *
 * Why this exists:
 * - "worldRegion" is NOT editorial content.
 * - It’s infrastructure used for your high-level filters (pills) and navigation.
 * - Updates should happen via scripts, not by manually editing Studio docs.
 *
 * Usage (recommended via npm scripts):
 *   npm run seed:worldRegions
 *   npm run seed:worldRegions -- --maps
 *   npm run seed:worldRegions:attach
 *   npm run seed:worldRegions:attach -- --maps
 *
 * Direct usage (only if you know what you’re doing):
 *   DOTENV_CONFIG_PATH=.env.local tsx -r dotenv/config scripts/seed-world-regions.ts ./path/to.csv --maps --attach
 *
 * Notes:
 * - This script expects your env vars to be available via dotenv.
 * - If you run it directly, make sure you pass DOTENV_CONFIG_PATH=.env.local (or use the npm scripts).
 */

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';

import { createClient } from '@sanity/client';
import countries from 'i18n-iso-countries';

/**
 * We register locales here only because we use i18n-iso-countries for
 * ISO3 -> ISO2 conversions (alpha3ToAlpha2).
 * The locale registration isn’t strictly required for that conversion,
 * but keeping it registered is harmless and future-proof if you later
 * need localized names.
 */
import en from 'i18n-iso-countries/langs/en.json' assert { type: 'json' };
countries.registerLocale(en);

/**
 * Sanity connection: these must be present.
 * - projectId + dataset: identify your Sanity project
 * - token: needs WRITE permissions (create/patch assets and docs)
 *
 * IMPORTANT:
 * If you see “Missing NEXT_PUBLIC_SANITY_PROJECT_ID”, you are NOT loading .env.local.
 * Use: tsx -r dotenv/config with DOTENV_CONFIG_PATH=.env.local (or use npm scripts).
 */
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId)
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local');
if (!dataset)
  throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET in .env.local');
if (!token) throw new Error('Missing SANITY_API_WRITE_TOKEN in .env.local');

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
});

/**
 * World Bank CSV row shape for this dataset:
 * - entity: country name in the dataset (not used for matching)
 * - iso3: ISO-3166-1 alpha-3 code (used to map to your country doc IDs)
 * - region: World Bank region label (seeded as worldRegion.title)
 */
type Row = {
  entity: string;
  iso3: string;
  region: string;
};

/**
 * Slugify for stable IDs and URL slugs.
 * We keep it deterministic so:
 * - worldRegion documents get stable _id values
 * - we can safely createIfNotExists()
 * - you can re-run seeds without duplicating docs
 */
function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/\(wb\)/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

/**
 * Minimal CSV parser for THIS specific dataset.
 *
 * Dataset columns: Entity, Code (ISO3), Year, Region
 * Region can contain commas and may be quoted, so we capture "rest of line" for it.
 * This is intentionally simple, not a universal CSV parser.
 */
function parseCsv(text: string): Row[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = lines.shift();
  if (!header) return [];

  const out: Row[] = [];
  for (const line of lines) {
    // parse 4 columns: Entity,Code,Year,Region
    // Region can be quoted and contain commas.
    const m = line.match(/^([^,]*),([^,]*),([^,]*),(.*)$/);
    if (!m) continue;

    const entity = m[1]?.trim();
    const iso3 = m[2]?.trim();
    const regionRaw = m[4]?.trim();

    // Strip surrounding quotes if present
    const region =
      regionRaw?.startsWith('"') && regionRaw.endsWith('"')
        ? regionRaw.slice(1, -1)
        : regionRaw;

    if (!entity || !iso3 || !region) continue;

    out.push({ entity, iso3, region });
  }

  return out;
}

/**
 * Normalizes region labels from the dataset:
 * e.g. "Europe and Central Asia (WB)" -> "Europe and Central Asia"
 * Keeps your "worldRegion.title" clean for UI.
 */
function normalizeRegionName(region: string) {
  return region.replace(/\s*\(WB\)\s*$/i, '').trim();
}

/**
 * Deterministic Sanity doc id for worldRegion documents.
 * This makes seeds repeatable and safe.
 */
function worldRegionIdFromTitle(title: string) {
  return `worldRegion-${slugify(title)}`;
}

// -----------------------------------------------------------------------------
// Optional: attach a canonical map image to each WorldRegion (seeded assets)
// Put the PNGs in: scripts/data/world-region-maps/
// Filenames must match the MAPS mapping below.
// -----------------------------------------------------------------------------

/**
 * Mapping: worldRegion slug -> filename.
 * - Keys must match `slugify(title)` output for each world region.
 * - Values are the PNG names located inside scripts/data/world-region-maps/
 */
const MAPS: Record<string, string> = {
  'latin-america-and-caribbean': 'latin-america-and-caribbean.png',
  'middle-east-north-africa-afghanistan-and-pakistan':
    'middle-east-north-africa-afghanistan-and-pakistan.png',
  'north-america': 'north-america.png',
  'south-asia': 'south-asia.png',
  'sub-saharan-africa': 'sub-saharan-africa.png',
  'east-asia-and-pacific': 'east-asia-and-pacific.png',
  'europe-and-central-asia': 'europe-and-central-asia.png',
};

/**
 * Region labels (long + short) for EN/IT.
 * Key MUST match slugify(title) output.
 * This is the single source of truth for UI labels.
 */

/**
 * Single source of truth for region labels.
 * Key MUST match slugify(title) output.
 */
const REGION_LABELS: Record<
  string,
  {
    // Long labels
    titleIt: string;

    // Short UI labels (pills/cards)
    shortTitle: string;
    shortTitleIt: string;
  }
> = {
  'east-asia-and-pacific': {
    titleIt: 'Asia Orientale e Pacifico',
    shortTitle: 'East Asia & Pacific',
    shortTitleIt: 'Asia Est & Pacifico',
  },
  'europe-and-central-asia': {
    titleIt: 'Europa e Asia Centrale',
    shortTitle: 'Europe & Central Asia',
    shortTitleIt: 'Europa & Asia Centrale',
  },
  'latin-america-and-caribbean': {
    titleIt: 'America Latina e Caraibi',
    shortTitle: 'Latin America & Caribbean',
    shortTitleIt: 'America Latina & Caraibi',
  },
  'middle-east-north-africa-afghanistan-and-pakistan': {
    titleIt: 'Medio Oriente e Nord Africa (Afghanistan e Pakistan)',
    shortTitle: 'Middle East & North Africa',
    shortTitleIt: 'Medio Oriente & Nord Africa',
  },
  'north-america': {
    titleIt: 'Nord America',
    shortTitle: 'North America',
    shortTitleIt: 'Nord America',
  },
  'south-asia': {
    titleIt: 'Asia Meridionale',
    shortTitle: 'South Asia',
    shortTitleIt: 'Asia del Sud',
  },
  'sub-saharan-africa': {
    titleIt: 'Africa Sub-sahariana',
    shortTitle: 'Sub-Saharan Africa',
    shortTitleIt: 'Africa Subsahariana',
  },
};

function getRegionLabels(slug: string, titleEn: string) {
  const mapped = REGION_LABELS[slug];

  return {
    title: titleEn,
    titleIt: mapped?.titleIt ?? titleEn,
    shortTitle: mapped?.shortTitle ?? titleEn,
    shortTitleIt: mapped?.shortTitleIt ?? mapped?.titleIt ?? titleEn,
  };
}

/**
 * Minimal type to represent worldRegion docs when we fetch them.
 * We keep mapImage as unknown because the asset object shape is handled by Sanity.
 */
type WorldRegionDoc = {
  _id: string;
  _type: 'worldRegion';
  title?: string;
  titleIt?: string;
  slug?: { current?: string };
  mapImage?: unknown;
};

/**
 * Where region PNGs live in your repo.
 * Keeping it relative to project root makes it work from anywhere in the repo.
 */
function mapsDirPath() {
  return path.join(process.cwd(), 'scripts', 'data', 'world-region-maps');
}

/**
 * Attach map images (PNG) to each worldRegion doc if missing.
 *
 * Behavior:
 * - Skips if file missing
 * - Skips if doc missing
 * - Skips if mapImage already set (idempotent)
 *
 * IMPORTANT:
 * This uploads assets to Sanity (requires write token permissions).
 */
async function attachMapImagesToWorldRegions() {
  const baseDir = mapsDirPath();

  console.log('Attaching map images to worldRegion docs (if missing)...');
  console.log(`Maps directory: ${baseDir}`);

  let updated = 0;
  let skippedHasImage = 0;
  let skippedMissingFile = 0;
  let skippedMissingDoc = 0;

  for (const [slug, filename] of Object.entries(MAPS)) {
    const filePath = path.join(baseDir, filename);

    if (!fs.existsSync(filePath)) {
      skippedMissingFile += 1;
      console.warn(`⚠️  Map file not found: ${filePath}`);
      continue;
    }

    const worldRegionId = `worldRegion-${slug}`;

    const doc = (await client.getDocument(
      worldRegionId,
    )) as WorldRegionDoc | null;
    if (!doc) {
      skippedMissingDoc += 1;
      console.warn(`⚠️  worldRegion doc not found: ${worldRegionId}`);
      continue;
    }

    // Already has an image => idempotent skip
    if (doc.mapImage) {
      skippedHasImage += 1;
      continue;
    }

    const stream = fs.createReadStream(filePath);

    // Upload asset to Sanity
    const asset = await client.assets.upload('image', stream, {
      filename,
      contentType: 'image/png',
    });

    // Patch doc with uploaded asset reference
    await client
      .patch(worldRegionId)
      .set({
        mapImage: {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id },
        },
      })
      .commit({ autoGenerateArrayKeys: true });

    updated += 1;
  }

  console.log(
    `✅ Map attach done. Updated: ${updated}. Skipped (already had image): ${skippedHasImage}. Skipped (missing file): ${skippedMissingFile}. Skipped (missing doc): ${skippedMissingDoc}.`,
  );
}

/**
 * Seeds worldRegion documents from the CSV rows.
 *
 * Strategy:
 * - Extract unique region titles
 * - Use deterministic IDs => worldRegion-{slug}
 * - Use createIfNotExists() so re-running is safe
 *
 * This does NOT attach map images or countries (those are separate flags).
 */
async function seedWorldRegions(rows: Row[]) {
  const unique = new Map<string, string>(); // title -> _id

  for (const r of rows) {
    const title = normalizeRegionName(r.region);
    if (!unique.has(title)) {
      unique.set(title, worldRegionIdFromTitle(title));
    }
  }

  const titles = [...unique.keys()];
  console.log(`Found ${titles.length} unique World Bank regions.`);

  for (const title of titles) {
    const _id = unique.get(title)!;

    // slug must match slugify(title) output and REGION_LABELS keys
    const slug = slugify(title);

    const labels = getRegionLabels(slug, title);

    const doc = {
      _id,
      _type: 'worldRegion',

      // Long labels
      title: labels.title,
      titleIt: labels.titleIt,

      // Short UI labels (pills/cards)
      shortTitle: labels.shortTitle,
      shortTitleIt: labels.shortTitleIt,

      slug: { current: slug },
      // order: optional (if you want a fixed order later)
    };

    await client.createIfNotExists({ _id, _type: 'worldRegion' });

    // Always patch to ensure fields stay up to date
    await client.createIfNotExists({ _id, _type: 'worldRegion' });

    // Always patch to ensure fields stay up to date
    await client
      .patch(_id)
      .set({
        title: labels.title,
        titleIt: labels.titleIt,
        shortTitle: labels.shortTitle,
        shortTitleIt: labels.shortTitleIt,
        slug: { current: slug },
        // order: ... (if you add it later)
      })
      .commit({ autoGenerateArrayKeys: true });
  }

  console.log(
    `✅ WorldRegion seed done. createIfNotExists ran for ${titles.length} docs.`,
  );
  console.log(`(Created or confirmed existing.)`);
}

/**
 * Auto-attaches worldRegion references onto country documents.
 *
 * How it matches countries:
 * - CSV provides iso3
 * - We convert iso3 -> iso2 using i18n-iso-countries
 * - Your country docs have deterministic ids: country-{iso2Lower}
 * - We patch country.worldRegion = reference(worldRegionId)
 *
 * This is safe to re-run: patch+set overwrites the same field deterministically.
 */
async function attachWorldRegionsToCountries(rows: Row[]) {
  // Build region title -> regionId map (same logic as seed)
  const regionIdByTitle = new Map<string, string>();
  for (const r of rows) {
    const title = normalizeRegionName(r.region);
    if (!regionIdByTitle.has(title)) {
      regionIdByTitle.set(title, worldRegionIdFromTitle(title));
    }
  }

  // Build iso2 -> regionId map using iso3 -> iso2 conversion
  const iso2ToRegionId = new Map<string, string>();

  for (const r of rows) {
    const iso2 = countries.alpha3ToAlpha2(r.iso3);
    if (!iso2) continue;

    const regionTitle = normalizeRegionName(r.region);
    const regionId = regionIdByTitle.get(regionTitle);
    if (!regionId) continue;

    iso2ToRegionId.set(iso2.toUpperCase(), regionId);
  }

  console.log(
    `Attaching worldRegion to countries: ${iso2ToRegionId.size} mappings.`,
  );

  let patched = 0;
  let missingCountry = 0;

  for (const [iso2, regionId] of iso2ToRegionId.entries()) {
    const countryDocId = `country-${iso2.toLowerCase()}`; // matches your deterministic IDs

    try {
      await client
        .patch(countryDocId)
        .set({
          worldRegion: { _type: 'reference', _ref: regionId },
        })
        .commit({ autoGenerateArrayKeys: true });

      patched += 1;
    } catch (err: unknown) {
      // Usually means the country doc doesn't exist yet
      missingCountry += 1;

      // Debug tip (safe narrowing):
      // const msg = err instanceof Error ? err.message : String(err);
      // console.warn(`Missing country doc for ISO2 ${iso2} (${countryDocId}): ${msg}`);
    }
  }

  console.log(
    `✅ Attach done. Patched: ${patched}. Missing country docs: ${missingCountry}.`,
  );
  console.log(
    `Tip: if missing is high, seed countries first (you did), then rerun attach.`,
  );
}

async function main() {
  /**
   * CLI contract:
   * - First argument can be a CSV path (optional)
   * - Flags:
   *    --maps   => upload+attach map images to worldRegions
   *    --attach => patch countries with worldRegion references
   */
  const csvPath =
    process.argv[2] ||
    path.join(
      process.cwd(),
      'scripts',
      'data',
      'world-regions-according-to-the-world-bank.csv',
    );

  const attach = process.argv.includes('--attach');
  const attachMaps = process.argv.includes('--maps');

  if (!fs.existsSync(csvPath)) {
    throw new Error(
      `CSV not found at: ${csvPath}\nPass a path as first arg, e.g.\n  tsx -r dotenv/config scripts/seed-world-regions.ts ./path/to/file.csv`,
    );
  }

  const csv = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCsv(csv);

  if (!rows.length) {
    throw new Error('No rows parsed from CSV (unexpected).');
  }

  // ✅ 1) Seed/update region docs first (required for --maps and for consistency)
  await seedWorldRegions(rows);

  // ✅ 2) Optional: attach map images (requires worldRegion docs to exist)
  if (attachMaps) {
    await attachMapImagesToWorldRegions();
  } else {
    console.log(
      'Skipped map images. Re-run with --maps to attach worldRegion map images.',
    );
  }

  // ✅ 3) Optional: attach refs onto countries
  if (attach) {
    await attachWorldRegionsToCountries(rows);
  } else {
    console.log('Skipped country attach. Re-run with --attach when ready.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
