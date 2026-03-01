const fs = require('fs');
const path = require('path');
const PlantEnergy = require('../models/PlantEnergy');
const plantEnergySeed = require('../data/plantEnergySeed');

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/* ── helpers ── */

function normalizeString(value, fallback = '') {
  if (!value || typeof value !== 'string') return fallback;
  return value.trim().toLowerCase();
}

function normalizeArray(values) {
  if (!Array.isArray(values)) return [];
  return values
    .map(function (v) { return typeof v === 'string' ? v.trim().toLowerCase() : ''; })
    .filter(Boolean);
}

/* ── match a scanned plant to energy DB ── */

function nameMatchScore(entry, query) {
  var q = normalizeString(query);
  if (!q) return 0;

  // exact slug hit
  if (entry.slug === q) return 1;

  // full-name matches
  var fields = [
    normalizeString(entry.commonName),
    normalizeString(entry.hindiName),
    normalizeString(entry.scientificName)
  ];

  for (var i = 0; i < fields.length; i++) {
    if (fields[i] && (fields[i] === q || fields[i].indexOf(q) !== -1 || q.indexOf(fields[i]) !== -1)) {
      return 0.95;
    }
  }

  // alias search
  var aliases = normalizeArray(entry.aliases);
  for (var j = 0; j < aliases.length; j++) {
    if (aliases[j] === q || aliases[j].indexOf(q) !== -1 || q.indexOf(aliases[j]) !== -1) {
      return 0.85;
    }
  }

  // partial word overlap (for multi-word queries like "snake plant yellow")
  var qWords = q.split(/\s+/);
  var allText = fields.concat(aliases).join(' ');
  var hits = 0;
  for (var k = 0; k < qWords.length; k++) {
    if (allText.indexOf(qWords[k]) !== -1) hits++;
  }
  var wordScore = qWords.length ? hits / qWords.length : 0;
  return wordScore * 0.7;
}

function imageHintScore(entry, hints) {
  if (!hints || !entry.imageHints) return 0;
  var checks = 0;
  var score = 0;

  var hintFields = ['leafShape', 'leafColors', 'flowerColors', 'distinctiveFeatures'];
  for (var i = 0; i < hintFields.length; i++) {
    var field = hintFields[i];
    var entryArr = normalizeArray(entry.imageHints[field]);
    var inputArr = normalizeArray(hints[field]);
    if (!inputArr.length) continue;
    checks++;
    var matched = inputArr.filter(function (inp) {
      return entryArr.some(function (e) { return e.indexOf(inp) !== -1 || inp.indexOf(e) !== -1; });
    }).length;
    if (matched > 0) score++;
  }
  return checks ? score / checks : 0;
}

/**
 * Match a scanned plant (by name + optional image hints) to our energy database.
 * Returns sorted array of matches with confidence.
 */
async function matchEnergyFromScan(params) {
  var plantName = params.plantName || '';
  var hints = params.imageHints || null;
  var limit = Math.min(Math.max(Number(params.limit) || 3, 1), 10);

  var entries = await PlantEnergy.find({ active: true }).lean();
  if (!entries.length) {
    return { status: 'no-data', matches: [], message: 'Energy database is empty. Seed data is required.' };
  }

  var scored = entries.map(function (entry) {
    var nScore = nameMatchScore(entry, plantName);
    var iScore = imageHintScore(entry, hints);
    // Name match is weighted more heavily than image hints
    var aggregate = Number((nScore * 0.7 + iScore * 0.3).toFixed(3));
    return { entry: entry, aggregate: aggregate, nameScore: nScore, imageScore: iScore };
  });

  scored.sort(function (a, b) { return b.aggregate - a.aggregate; });
  var top = scored.slice(0, limit).filter(function (s) { return s.aggregate > 0.15; });

  if (!top.length) {
    return {
      status: 'no-match',
      matches: [],
      message: 'No matching plant found in energy database for "' + plantName + '". Data may need to be added.'
    };
  }

  var matches = top.map(function (item) {
    return {
      confidence: Number(Math.min(0.98, item.aggregate).toFixed(2)),
      plant: item.entry
    };
  });

  return { status: 'matched', matches: matches };
}

/* ── search (text, slug, browse) ── */

async function searchEnergy(query, limit) {
  var safeLimit = Math.min(Math.max(Number(limit) || 5, 1), 20);
  var text = String(query || '').trim();

  if (!text) {
    return PlantEnergy.find({ active: true })
      .sort({ 'energy.score': -1 })
      .limit(safeLimit)
      .lean();
  }

  return PlantEnergy.find(
    {
      active: true,
      $or: [
        { commonName: { $regex: text, $options: 'i' } },
        { hindiName: { $regex: text, $options: 'i' } },
        { scientificName: { $regex: text, $options: 'i' } },
        { aliases: { $elemMatch: { $regex: text, $options: 'i' } } },
        { 'energy.summary': { $regex: text, $options: 'i' } }
      ]
    },
    null,
    { limit: safeLimit }
  ).lean();
}

async function getEnergyBySlug(slug) {
  if (!slug) return null;
  return PlantEnergy.findOne({ slug: normalizeString(slug), active: true }).lean();
}

/* ── CRUD / upsert ── */

async function upsertEnergyEntries(entries, reviewedBy) {
  var cleanEntries = Array.isArray(entries) ? entries.filter(Boolean) : [];
  var updated = 0;

  for (var i = 0; i < cleanEntries.length; i++) {
    var item = cleanEntries[i];
    if (!item.slug || !item.commonName) continue;

    await PlantEnergy.findOneAndUpdate(
      { slug: item.slug },
      {
        ...item,
        verification: {
          ...(item.verification || {}),
          reviewedBy: reviewedBy || 'admin-api',
          lastVerifiedAt: new Date()
        },
        active: true
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    updated++;
  }

  return { updated: updated };
}

/* ── seeding ── */

async function ensureEnergySeeded() {
  var count = await PlantEnergy.countDocuments();
  if (count > 0) return { seeded: 0, skipped: true };
  var result = await upsertEnergyEntries(plantEnergySeed, 'system-seed');
  return { seeded: result.updated, skipped: false };
}

/* ── daily refresh ── */

async function loadDailyEnergyUpdates() {
  var updatesPath = path.join(__dirname, '..', 'data', 'plantEnergyDaily.json');
  if (!fs.existsSync(updatesPath)) {
    return { loaded: 0, message: 'No daily energy update file found.' };
  }

  var parsed = JSON.parse(fs.readFileSync(updatesPath, 'utf8'));
  var entries = Array.isArray(parsed) ? parsed : parsed.entries;
  if (!Array.isArray(entries) || !entries.length) {
    return { loaded: 0, message: 'Daily energy update file is empty.' };
  }

  var result = await upsertEnergyEntries(entries, 'daily-file-sync');
  return { loaded: result.updated, message: 'Daily energy update file processed.' };
}

async function runDailyEnergyRefresh() {
  await ensureEnergySeeded();

  // Mark entries not verified in 30 days as review-needed
  var staleBefore = new Date(Date.now() - 30 * ONE_DAY_MS);
  await PlantEnergy.updateMany(
    {
      active: true,
      'verification.lastVerifiedAt': { $lt: staleBefore }
    },
    {
      $set: { 'verification.status': 'review-needed' }
    }
  );

  var fileSync = await loadDailyEnergyUpdates();
  return { ok: true, refreshedAt: new Date(), fileSync: fileSync };
}

function startDailyEnergyRefresh() {
  var intervalHours = Number(process.env.ENERGY_REFRESH_HOURS || 24);
  var ms = Math.max(1, intervalHours) * 60 * 60 * 1000;

  setInterval(async function () {
    try {
      var result = await runDailyEnergyRefresh();
      console.log('Plant energy refresh complete:', result);
    } catch (err) {
      console.error('Plant energy refresh failed:', err.message);
    }
  }, ms);
}

module.exports = {
  matchEnergyFromScan: matchEnergyFromScan,
  searchEnergy: searchEnergy,
  getEnergyBySlug: getEnergyBySlug,
  upsertEnergyEntries: upsertEnergyEntries,
  ensureEnergySeeded: ensureEnergySeeded,
  runDailyEnergyRefresh: runDailyEnergyRefresh,
  startDailyEnergyRefresh: startDailyEnergyRefresh
};
