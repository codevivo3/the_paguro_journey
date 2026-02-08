import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json' assert { type: 'json' };

countries.registerLocale(en);

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID');
if (!dataset) throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET');
if (!token) throw new Error('Missing SANITY_API_WRITE_TOKEN');

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
});

type Row = { iso3: string; region: string };

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/\(wb\)/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

function normalizeRegionName(region: string) {
  return region.replace(/\s*\(WB\)\s*$/i, '').trim();
}

function parseCsv(text: string): Row[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  lines.shift(); // header
  const out: Row[] = [];

  for (const line of lines) {
    const m = line.match(/^([^,]*),([^,]*),([^,]*),(.*)$/);
    if (!m) continue;

    const iso3 = m[2]?.trim();
    const regionRaw = m[4]?.trim();
    const region =
      regionRaw?.startsWith('"') && regionRaw.endsWith('"')
        ? regionRaw.slice(1, -1)
        : regionRaw;

    if (!iso3 || !region) continue;
    out.push({ iso3, region });
  }

  return out;
}

async function main() {
  const csvPath = path.join(
    process.cwd(),
    'scripts',
    'data',
    'world-regions-according-to-the-world-bank.csv',
  );

  if (!fs.existsSync(csvPath)) throw new Error(`CSV not found: ${csvPath}`);
  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));

  // Build ISO2 -> worldRegionId map
  const iso2ToRegionId = new Map<string, string>();
  for (const r of rows) {
    const iso2 = countries.alpha3ToAlpha2(r.iso3);
    if (!iso2) continue;

    const regionTitle = normalizeRegionName(r.region);
    const regionSlug = slugify(regionTitle);
    const regionId = `worldRegion-${regionSlug}`;

    iso2ToRegionId.set(iso2.toUpperCase(), regionId);
  }

  let patched = 0;
  let skippedAlreadyHas = 0;
  let missingCountry = 0;
  let missingRegion = 0;

  for (const [iso2, regionId] of iso2ToRegionId.entries()) {
    const countryId = `country-${iso2.toLowerCase()}`;

    const country = await client.fetch<{
      _id: string;
      worldRegion?: { _ref: string };
    } | null>(`*[_type=="country" && _id==$id][0]{ _id, worldRegion }`, {
      id: countryId,
    });

    if (!country) {
      missingCountry += 1;
      continue;
    }

    // THE RULE: only patch if missing
    if (country.worldRegion?._ref) {
      skippedAlreadyHas += 1;
      continue;
    }

    const regionExists = await client.getDocument(regionId);
    if (!regionExists) {
      missingRegion += 1;
      continue;
    }

    await client
      .patch(countryId)
      .set({ worldRegion: { _type: 'reference', _ref: regionId } })
      .commit({ autoGenerateArrayKeys: true });

    patched += 1;
  }

  console.log('Done:', {
    patched,
    skippedAlreadyHas,
    missingCountry,
    missingRegion,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
