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

type UnknownRecord = Record<string, unknown>;

function getNestedString(obj: unknown, path: string[]): string | undefined {
  let cur: unknown = obj;
  for (const key of path) {
    if (!cur || typeof cur !== 'object') return undefined;
    cur = (cur as UnknownRecord)[key];
  }
  return typeof cur === 'string' ? cur : undefined;
}

function slugifyISO2(code: string): string {
  return code.toLowerCase();
}

function isBlank(v: unknown): boolean {
  return typeof v !== 'string' || v.trim().length === 0;
}

function shouldDryRun(): boolean {
  return process.argv.includes('--dry-run');
}

function shouldUpsertMissing(): boolean {
  return process.argv.includes('--upsert-missing');
}

function shouldOverwrite(): boolean {
  return process.argv.includes('--overwrite');
}

async function main() {
  const dryRun = shouldDryRun();
  const upsertMissing = shouldUpsertMissing();
  const overwrite = shouldOverwrite();

  // Use Intl.DisplayNames for short/common names when possible.
  // (e.g. "China" instead of "People's Republic of China").
  // We still use i18n-iso-countries to get a stable list of ISO2 codes.
  const displayEn = new Intl.DisplayNames(['en'], { type: 'region' });
  const displayIt = new Intl.DisplayNames(['it'], { type: 'region' });

  // Build the ISO2 list from i18n-iso-countries `getNames`, which is keyed by ISO-3166 alpha-2 codes.
  // Some environments / library versions can return unexpected values from getAlpha2Codes(),
  // so we avoid that API entirely and derive the ISO2 set from the canonical names map.
  const namesEn = countries.getNames('en', { select: 'official' }) as Record<string, string>;
  const iso2Codes = Object.keys(namesEn)
    .map((code) => String(code).trim().toUpperCase())
    .filter((code) => /^[A-Z]{2}$/.test(code))
    .sort();

  if (iso2Codes.length === 0) {
    throw new Error(
      'No ISO2 country codes found (expected ISO-3166 alpha-2 like "IT", "US"). Check i18n-iso-countries version/data.'
    );
  }

  function displayName(dn: Intl.DisplayNames, iso2: string): string | undefined {
    try {
      const v = dn.of(iso2);
      return typeof v === 'string' && v.trim() ? v.trim() : undefined;
    } catch {
      // Some region codes are not supported by the runtime's Intl data.
      return undefined;
    }
  }

  console.log(
    `${dryRun ? '🧪 DRY RUN — ' : ''}Seeding/backfilling ${iso2Codes.length} countries into ${projectId}/${dataset}...`
  );
  console.log(
    `Mode: ${overwrite ? 'overwrite' : 'backfill'} nameI18n. ${upsertMissing ? 'Also create missing docs.' : 'No upsert of missing docs.'}`
  );

  let created = 0;
  let updated = 0;
  let unchanged = 0;
  let missing = 0;
  let failed = 0;

  // Batch patches into transactions to keep writes efficient.
  const BATCH_SIZE = 50;
  let tx = client.transaction();
  let txCount = 0;

  async function commitTxIfNeeded(force = false) {
    if (!force && txCount < BATCH_SIZE) return;
    if (txCount === 0) return;

    if (dryRun) {
      console.log(`🧪 DRY RUN: would commit transaction with ${txCount} patches`);
    } else {
      await tx.commit({ visibility: 'async' });
      console.log(`✅ Committed transaction with ${txCount} patches`);
    }

    tx = client.transaction();
    txCount = 0;
  }

  for (const iso2 of iso2Codes) {
    const slug = slugifyISO2(iso2);
    const _id = `country-${slug}`;

    // Fallbacks from i18n-iso-countries (when Intl.DisplayNames can't resolve a code).
    // Prefer a shorter / more common label when available (alias), then fall back to official.
    const isoAliasEn =
      countries.getName(iso2, 'en', { select: 'alias' }) ?? undefined;
    const isoAliasIt =
      countries.getName(iso2, 'it', { select: 'alias' }) ?? undefined;

    const isoOfficialEn =
      countries.getName(iso2, 'en', { select: 'official' }) ?? undefined;
    const isoOfficialIt =
      countries.getName(iso2, 'it', { select: 'official' }) ?? undefined;

    const desiredEn =
      displayName(displayEn, iso2) ??
      isoAliasEn ??
      isoOfficialEn ??
      iso2;

    // Italian name is optional; if missing, we leave it undefined.
    const desiredIt =
      displayName(displayIt, iso2) ??
      isoAliasIt ??
      isoOfficialIt;

    try {
      // Prefer reading existing doc to avoid overwriting and to decide what to patch.
      const existing = await client.getDocument(_id);

      if (!existing) {
        missing += 1;

        if (!upsertMissing) {
          // Do not create missing docs unless explicitly asked.
          continue;
        }

        const doc = {
          _id,
          _type: 'country',
          // Keep existing behavior: title defaults to IT name if available.
          title: desiredIt ?? desiredEn,
          isoCode: iso2,
          slug: { current: slug },
          // Public-facing names
          nameI18n: {
            en: desiredEn,
            // Italian is optional in the schema, so only set when available.
            ...(desiredIt ? { it: desiredIt } : {}),
          },
        };

        if (dryRun) {
          console.log(
            `🧪 DRY RUN: would create ${_id} (${iso2}) nameI18n.en='${desiredEn}'${
              desiredIt ? ` nameI18n.it='${desiredIt}'` : ''
            }`
          );
        } else {
          await client.createIfNotExists(doc);
        }

        created += 1;
        continue;
      }

      const currentEn = getNestedString(existing, ['nameI18n', 'en']);
      const currentIt = getNestedString(existing, ['nameI18n', 'it']);

      const setPatch: Record<string, unknown> = {};

      // EN is required in the schema. Always ensure it exists.
      // - Default behavior: only backfill when blank.
      // - With --overwrite: force-sync from ISO names.
      if (overwrite || isBlank(currentEn)) {
        setPatch['nameI18n.en'] = desiredEn;
      }

      // IT is optional; set when we have a value.
      // - Default behavior: only backfill when blank.
      // - With --overwrite: force-sync from ISO names (and remove the field when no IT exists).
      if (overwrite) {
        if (desiredIt) {
          setPatch['nameI18n.it'] = desiredIt;
        } else {
          // If the library doesn't provide an Italian name for a code, ensure we don't keep stale values.
          setPatch['nameI18n.it'] = undefined;
        }
      } else {
        if (desiredIt && isBlank(currentIt)) {
          setPatch['nameI18n.it'] = desiredIt;
        }
      }

      // If we set nameI18n.it to undefined above, Sanity will ignore it unless we unset it.
      // Convert that into an explicit unset.
      const shouldUnsetIt = overwrite && !desiredIt && !isBlank(currentIt);

      if (Object.keys(setPatch).length === 0 && !shouldUnsetIt) {
        unchanged += 1;
        continue;
      }

      updated += 1;

      if (dryRun) {
        console.log(
          `🧪 DRY RUN: would patch ${_id} (${iso2})`,
          setPatch,
          shouldUnsetIt ? '(unset nameI18n.it)' : ''
        );
      } else {
        tx = tx.patch(_id, (p) => {
          let next = p;
          if (Object.keys(setPatch).length > 0) {
            next = next.set(setPatch);
          }
          if (shouldUnsetIt) {
            next = next.unset(['nameI18n.it']);
          }
          return next;
        });
        txCount += 1;
        await commitTxIfNeeded(false);
      }
    } catch (err: unknown) {
      failed += 1;
      if (err instanceof Error) {
        console.error(`❌ Failed for ${iso2}:`, err.message);
      } else {
        console.error(`❌ Failed for ${iso2}:`, err);
      }
    }
  }

  // Commit any remaining patches
  await commitTxIfNeeded(true);

  console.log(
    `✅ Done. Created: ${created}, Updated: ${updated}, Unchanged: ${unchanged}, Missing (not created): ${missing - (created > 0 ? created : 0)}, Failed: ${failed}`
  );
  console.log(`Open Studio → Travel Guide → Countries.`);
  console.log(`Run with --dry-run to preview.`);
  console.log(`Add --upsert-missing to create missing docs.`);
  console.log(`Add --overwrite to force-sync nameI18n from ISO names.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
