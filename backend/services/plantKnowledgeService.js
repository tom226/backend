const fs = require('fs');
const path = require('path');
const PlantKnowledge = require('../models/PlantKnowledge');
const plantKnowledgeSeed = require('../data/plantKnowledgeSeed');

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function normalizeString(value, fallback = 'unknown') {
  if (!value || typeof value !== 'string') return fallback;
  return value.trim().toLowerCase();
}

function normalizeArray(values = []) {
  if (!Array.isArray(values)) return [];
  return values
    .map(v => (typeof v === 'string' ? v.trim().toLowerCase() : ''))
    .filter(Boolean);
}

function verifyObservationDetails(payload = {}) {
  const leaf = payload.leafCondition || {};
  const soil = payload.soilCondition || {};
  const env = payload.environment || {};

  const required = [
    ['leafCondition.color', leaf.color],
    ['leafCondition.texture', leaf.texture],
    ['soilCondition.moisture', soil.moisture],
    ['soilCondition.drainage', soil.drainage],
    ['soilCondition.smell', soil.smell],
    ['environment.locationType', env.locationType],
    ['environment.sunlightHours', env.sunlightHours]
  ];

  const missingFields = required
    .filter(([, value]) => value === undefined || value === null || value === '' || value === 'unknown')
    .map(([field]) => field);

  const completenessScore = Number(((required.length - missingFields.length) / required.length).toFixed(2));

  return {
    completenessScore,
    missingFields,
    isSufficientForHighConfidence: completenessScore >= 0.72
  };
}

function symptomScore(entry = {}, observedSymptoms = []) {
  const normalized = normalizeArray(observedSymptoms);
  if (!normalized.length) return 0;
  const symptomText = (entry.symptoms || []).map(s => String(s).toLowerCase());
  const hits = normalized.filter(ob => symptomText.some(s => s.includes(ob) || ob.includes(s))).length;
  return hits / normalized.length;
}

function fieldMatchScore(entry = {}, observation = {}) {
  const leaf = observation.leafCondition || {};
  const soil = observation.soilCondition || {};
  const env = observation.environment || {};

  let score = 0;
  let checks = 0;

  if (leaf.color) {
    checks += 1;
    const colors = (entry.leafIndicators?.colors || []).map(c => c.toLowerCase());
    if (colors.some(c => c.includes(normalizeString(leaf.color)) || normalizeString(leaf.color).includes(c))) score += 1;
  }

  if (leaf.texture) {
    checks += 1;
    const textures = (entry.leafIndicators?.textures || []).map(t => t.toLowerCase());
    if (textures.some(t => t.includes(normalizeString(leaf.texture)) || normalizeString(leaf.texture).includes(t))) score += 1;
  }

  if (soil.moisture) {
    checks += 1;
    const values = (entry.soilIndicators?.moisture || []).map(v => v.toLowerCase());
    if (values.includes(normalizeString(soil.moisture))) score += 1;
  }

  if (soil.drainage) {
    checks += 1;
    const values = (entry.soilIndicators?.drainage || []).map(v => v.toLowerCase());
    if (values.includes(normalizeString(soil.drainage))) score += 1;
  }

  if (soil.smell) {
    checks += 1;
    const values = (entry.soilIndicators?.smell || []).map(v => v.toLowerCase());
    if (values.includes(normalizeString(soil.smell))) score += 1;
  }

  if (env.locationType) {
    checks += 1;
    const values = (entry.environmentIndicators?.locationType || []).map(v => v.toLowerCase());
    if (values.includes(normalizeString(env.locationType))) score += 1;
  }

  if (typeof env.sunlightHours === 'number') {
    checks += 1;
    const range = entry.environmentIndicators?.sunlightHours || { min: 0, max: 24 };
    if (env.sunlightHours >= range.min && env.sunlightHours <= range.max) score += 1;
  }

  return checks ? score / checks : 0;
}

function computeConfidence(matchScore, verification) {
  const base = 0.45 + matchScore * 0.45 + verification.completenessScore * 0.1;
  return Number(Math.min(0.97, Math.max(0.3, base)).toFixed(2));
}

async function diagnoseFromKnowledge(observation = {}) {
  const verification = verifyObservationDetails(observation);
  const entries = await PlantKnowledge.find({ active: true }).lean();

  if (!entries.length) {
    return {
      status: 'no-data',
      verification,
      message: 'Knowledge base is empty. Seed data is required.'
    };
  }

  const scored = entries.map(entry => {
    const symptom = symptomScore(entry, observation.symptoms || []);
    const fields = fieldMatchScore(entry, observation);
    const aggregate = Number((symptom * 0.55 + fields * 0.45).toFixed(3));
    return { entry, aggregate };
  });

  scored.sort((a, b) => b.aggregate - a.aggregate);
  const best = scored[0];

  if (!best || best.aggregate < 0.15) {
    return {
      status: 'insufficient-match',
      verification,
      message: 'No strong disease match. More leaf and soil details are required.',
      askFor: verification.missingFields
    };
  }

  const confidence = computeConfidence(best.aggregate, verification);
  const entry = best.entry;

  return {
    status: verification.isSufficientForHighConfidence ? 'verified-result' : 'provisional-result',
    verification,
    diseaseKey: entry.slug,
    disease: entry.diseaseName,
    severity: entry.severity,
    confidence,
    summary: entry.summary,
    symptoms: entry.symptoms,
    remedies: entry.solutions.map(solution => ({
      name: solution.title,
      frequency: solution.estimatedDays,
      steps: solution.steps.join(' '),
      icon: '🌿',
      ingredients: 'Follow the listed treatment steps.'
    })),
    prevention: entry.preventiveCare,
    products: entry.recommendedProducts,
    references: entry.references,
    source: 'knowledge-db'
  };
}

async function searchKnowledge(query = '', limit = 5) {
  const safeLimit = Math.min(Math.max(Number(limit) || 5, 1), 10);
  const text = String(query || '').trim();

  if (!text) {
    return PlantKnowledge.find({ active: true }).sort({ 'verification.evidenceScore': -1 }).limit(safeLimit).lean();
  }

  return PlantKnowledge.find(
    {
      active: true,
      $or: [
        { diseaseName: { $regex: text, $options: 'i' } },
        { aliases: { $elemMatch: { $regex: text, $options: 'i' } } },
        { symptoms: { $elemMatch: { $regex: text, $options: 'i' } } },
        { summary: { $regex: text, $options: 'i' } }
      ]
    },
    null,
    { limit: safeLimit }
  ).lean();
}

async function upsertKnowledgeEntries(entries = [], reviewedBy = 'admin-api') {
  const cleanEntries = Array.isArray(entries) ? entries.filter(Boolean) : [];
  let updated = 0;

  for (const item of cleanEntries) {
    if (!item.slug || !item.diseaseName) continue;
    await PlantKnowledge.findOneAndUpdate(
      { slug: item.slug },
      {
        ...item,
        verification: {
          ...(item.verification || {}),
          reviewedBy,
          lastVerifiedAt: new Date()
        },
        active: true
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    updated += 1;
  }

  return { updated };
}

async function loadDailyUpdatesFromDisk() {
  const updatesPath = path.join(__dirname, '..', 'data', 'plantKnowledgeDaily.json');
  if (!fs.existsSync(updatesPath)) {
    return { loaded: 0, message: 'No daily update file found.' };
  }

  const parsed = JSON.parse(fs.readFileSync(updatesPath, 'utf8'));
  const entries = Array.isArray(parsed) ? parsed : parsed.entries;
  if (!Array.isArray(entries) || !entries.length) {
    return { loaded: 0, message: 'Daily update file is empty.' };
  }

  const result = await upsertKnowledgeEntries(entries, 'daily-file-sync');
  return { loaded: result.updated, message: 'Daily update file processed.' };
}

async function ensureKnowledgeSeeded() {
  const count = await PlantKnowledge.countDocuments();
  if (count > 0) return { seeded: 0, skipped: true };
  const result = await upsertKnowledgeEntries(plantKnowledgeSeed, 'system-seed');
  return { seeded: result.updated, skipped: false };
}

async function runDailyKnowledgeRefresh() {
  await ensureKnowledgeSeeded();

  const staleBefore = new Date(Date.now() - 30 * ONE_DAY_MS);
  await PlantKnowledge.updateMany(
    {
      active: true,
      'verification.lastVerifiedAt': { $lt: staleBefore }
    },
    {
      $set: {
        'verification.status': 'review-needed'
      }
    }
  );

  const fileSync = await loadDailyUpdatesFromDisk();
  return {
    ok: true,
    refreshedAt: new Date(),
    fileSync
  };
}

function startDailyKnowledgeRefresh() {
  const intervalHours = Number(process.env.KNOWLEDGE_REFRESH_HOURS || 24);
  const ms = Math.max(1, intervalHours) * 60 * 60 * 1000;

  setInterval(async () => {
    try {
      const result = await runDailyKnowledgeRefresh();
      console.log('Plant knowledge refresh complete:', result);
    } catch (err) {
      console.error('Plant knowledge refresh failed:', err.message);
    }
  }, ms);
}

module.exports = {
  verifyObservationDetails,
  diagnoseFromKnowledge,
  searchKnowledge,
  upsertKnowledgeEntries,
  ensureKnowledgeSeeded,
  runDailyKnowledgeRefresh,
  startDailyKnowledgeRefresh
};
