import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';

import { createClient } from '@sanity/client';
import countries from 'i18n-iso-countries';

// If you ever need localized names later, you can register locales here.
// For ISO conversion only, it’s not strictly required.
import en from 'i18n-iso-countries/langs/en.json' assert { type: 'json' };
countries.registerLocale(en);

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

type Row = {
  entity: string;
  iso3: string;
  region: string;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/\(wb\)/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

// Minimal CSV parser that handles quotes/commas properly for this dataset
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

function normalizeRegionName(region: string) {
  // dataset looks like: "Europe and Central Asia (WB)"
  return region.replace(/\s*\(WB\)\s*$/i, '').trim();
}

function worldRegionIdFromTitle(title: string) {
  return `worldRegion-${slugify(title)}`;
}

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

  let created = 0;

  for (const title of titles) {
    const _id = unique.get(title)!;
    const doc = {
      _id,
      _type: 'worldRegion',
      title,
      slug: { current: slugify(title) },
      // order: optional (if you want a fixed order later)
    };

    const res = await client.createIfNotExists(doc);
    if (res?._id) created += 1;
  }

  console.log(
    `✅ WorldRegion seed done. createIfNotExists ran for ${titles.length} docs.`,
  );
  console.log(`(Created or confirmed existing.)`);
}

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
      // Usually means: country doc doesn't exist yet
      missingCountry += 1;

      // If you ever want to debug, you can narrow the error safely:
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
  // Put your CSV in your repo, e.g. scripts/data/world-bank-regions.csv
  // For now, point to wherever you saved it.
  const csvPath =
    process.argv[2] ||
    path.join(
      process.cwd(),
      'scripts',
      'data',
      'world-regions-according-to-the-world-bank.csv',
    );

  const attach = process.argv.includes('--attach');

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

  await seedWorldRegions(rows);

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
