import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

// Load env files similar to Next.js (first match wins for each key)
const envCandidates = [
  '.env.local',
  '.env.development.local',
  '.env.development',
  '.env',
];

for (const file of envCandidates) {
  const p = path.resolve(process.cwd(), file);
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
  }
}

if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.NEXT_PUBLIC_SANITY_DATASET || !process.env.SANITY_API_WRITE_TOKEN) {
  throw new Error(
    'Missing Sanity env vars. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, and SANITY_API_WRITE_TOKEN.',
  );
}

console.log('Env loaded:', {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? null,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? null,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-01-01',
  hasWriteToken: Boolean(process.env.SANITY_API_WRITE_TOKEN),
});

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN!, // MUST be a write token
  useCdn: false,
});

console.log('Sanity target:', {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-01-01',
});

async function run() {
  // 1️⃣ Find Mongolia (by ISO2 or slug)
  const country = await client.fetch<{
    _id: string;
    title: string;
    iso2?: string;
    iso2Code?: string;
    slug?: string;
    worldRegion?: { _ref: string };
  }>(
    `*[_type=="country" && (
        iso2=="MN" ||
        iso2Code=="MN" ||
        iso_2=="MN" ||
        slug.current=="mn" ||
        title=="Mongolia"
      )][0]{
      _id,
      title,
      iso2,
      iso2Code,
      "slug": slug.current,
      worldRegion
    }`,
  );

  if (!country) {
    throw new Error('Mongolia not found');
  }

  console.log('Found country:', {
    _id: country._id,
    title: country.title,
    iso2: country.iso2,
    iso2Code: country.iso2Code,
    slug: country.slug,
    worldRegion: country.worldRegion?._ref ?? null,
  });

  if (country.worldRegion) {
    console.log('Mongolia already has a worldRegion → nothing to do');
    return;
  }

  // 2️⃣ Find the WB region
  const region = await client.fetch<{
    _id: string;
    titleIt: string;
    slug?: string;
  }>(
    `*[_type=="worldRegion" && (
        slug.current=="east-asia-and-pacific" ||
        title=="East Asia and Pacific" ||
        titleIt=="East Asia and Pacific" ||
        titleIt match "*East Asia*"
      )][0]{
      _id,
      titleIt,
      "slug": slug.current
    }`,
  );

  if (!region) {
    throw new Error('WorldRegion not found');
  }

  console.log('Found region:', { _id: region._id, titleIt: region.titleIt, slug: region.slug });

  // 3️⃣ Patch Mongolia
  await client
    .patch(country._id)
    .set({
      worldRegion: {
        _type: 'reference',
        _ref: region._id,
      },
    })
    .commit();

  const updated = await client.fetch<{ worldRegion?: { _ref: string }; worldRegionExpanded?: { titleIt?: string; title?: string; slug?: string } }>(
    `*[_type=="country" && _id=="${country._id}"][0]{
      worldRegion,
      "worldRegionExpanded": worldRegion->{ titleIt, title, "slug": slug.current }
    }`,
  );

  console.log('After patch worldRegion:', {
    ref: updated?.worldRegion?._ref ?? null,
    expanded: updated?.worldRegionExpanded ?? null,
  });

  console.log(`✅ Patched ${country.title} → ${region.titleIt}${region.slug ? ` (${region.slug})` : ''}`);
}

run().catch(console.error);
