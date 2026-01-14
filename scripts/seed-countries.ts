import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@sanity/client';
import countries from 'i18n-iso-countries';

import en from 'i18n-iso-countries/langs/en.json' assert { type: 'json' };
import it from 'i18n-iso-countries/langs/it.json' assert { type: 'json' };

countries.registerLocale(en);
countries.registerLocale(it);

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

function slugifyISO2(code: string): string {
  return code.toLowerCase();
}

async function main() {
  const namesEn = countries.getNames('en', { select: 'official' });
  const namesIt = countries.getNames('it', { select: 'official' });

  const iso2Codes = Object.keys(namesEn).sort();

  console.log(
    `Seeding ${iso2Codes.length} countries into ${projectId}/${dataset}...`
  );

  let created = 0;
  let skipped = 0;

  for (const iso2 of iso2Codes) {
    const slug = slugifyISO2(iso2);
    const _id = `country-${slug}`;

    const doc = {
      _id,
      _type: 'country',
      title: namesIt[iso2] ?? namesEn[iso2] ?? iso2,
      isoCode: iso2,
      slug: { current: slug },
    };

    try {
      const res = await client.createIfNotExists(doc);
      if (res?._id) created += 1;
      else skipped += 1;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(`❌ Failed for ${iso2}:`, err.message);
      } else {
        console.error(`❌ Failed for ${iso2}:`, err);
      }
    }
  }

  console.log(`✅ Done. Created: ${created}, skipped(existing): ${skipped}`);
  console.log(`Open Studio → Travel Guide → Countries.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
