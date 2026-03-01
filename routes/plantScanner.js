const express = require('express');
const { diagnoseFromKnowledge } = require('../services/plantKnowledgeService');
const {
  matchEnergyFromScan,
  searchEnergy,
  getEnergyBySlug,
  upsertEnergyEntries
} = require('../services/plantEnergyService');

const router = express.Router();

function deriveSymptomsFromInput(input = {}) {
  const symptoms = new Set((input.symptoms || []).map(s => String(s).toLowerCase()));
  const leaf = input.leafCondition || {};
  const soil = input.soilCondition || {};

  if (leaf.hasSpots) symptoms.add('brown spots on leaves');
  if (leaf.isWilting) symptoms.add('wilting with wet soil');
  if (leaf.hasPests) symptoms.add('visible tiny insects');
  if (normalize(leaf.color) === 'yellow') symptoms.add('yellowing leaves');
  if (normalize(soil.smell) === 'foul') symptoms.add('foul smell from soil');

  return Array.from(symptoms);
}

function normalize(value) {
  if (!value || typeof value !== 'string') return 'unknown';
  return value.trim().toLowerCase();
}

router.post('/analyze', async (req, res) => {
  try {
    const body = req.body || {};
    const payload = {
      source: 'scanner',
      plantName: body.plantName || 'unknown',
      symptoms: deriveSymptomsFromInput(body),
      leafCondition: {
        color: normalize(body.leafCondition?.color),
        texture: normalize(body.leafCondition?.texture),
        hasSpots: Boolean(body.leafCondition?.hasSpots),
        isWilting: Boolean(body.leafCondition?.isWilting),
        hasPests: Boolean(body.leafCondition?.hasPests)
      },
      soilCondition: {
        moisture: normalize(body.soilCondition?.moisture),
        drainage: normalize(body.soilCondition?.drainage),
        smell: normalize(body.soilCondition?.smell),
        texture: normalize(body.soilCondition?.texture),
        pH: typeof body.soilCondition?.pH === 'number' ? body.soilCondition.pH : undefined
      },
      environment: {
        locationType: normalize(body.environment?.locationType),
        sunlightHours: Number(body.environment?.sunlightHours),
        humidity: Number(body.environment?.humidity),
        temperatureC: Number(body.environment?.temperatureC)
      }
    };

    if (!Number.isFinite(payload.environment.sunlightHours)) {
      payload.environment.sunlightHours = undefined;
    }
    if (!Number.isFinite(payload.environment.humidity)) {
      payload.environment.humidity = undefined;
    }
    if (!Number.isFinite(payload.environment.temperatureC)) {
      payload.environment.temperatureC = undefined;
    }

    const result = await diagnoseFromKnowledge(payload);
    return res.json(result);
  } catch (err) {
    console.error('Plant scanner analyze failed:', err);
    return res.status(500).json({ error: 'Plant scanner analysis failed.' });
  }
});

/* ═══════════════════════════════════════════════════════════════
   PLANT ENERGY ENDPOINTS
   ═══════════════════════════════════════════════════════════════ */

/**
 * POST /energy/match
 * Match a scanned plant to energy database.
 * Body: { plantName: string, imageHints?: object, limit?: number }
 */
router.post('/energy/match', async (req, res) => {
  try {
    var body = req.body || {};
    var result = await matchEnergyFromScan({
      plantName: body.plantName || '',
      imageHints: body.imageHints || null,
      limit: body.limit || 3
    });
    return res.json(result);
  } catch (err) {
    console.error('Energy match failed:', err);
    return res.status(500).json({ error: 'Energy match failed.' });
  }
});

/**
 * GET /energy/search?q=...&limit=5
 * Text search the energy database.
 */
router.get('/energy/search', async (req, res) => {
  try {
    var results = await searchEnergy(req.query.q, req.query.limit);
    return res.json({ status: 'ok', count: results.length, entries: results });
  } catch (err) {
    console.error('Energy search failed:', err);
    return res.status(500).json({ error: 'Energy search failed.' });
  }
});

/**
 * GET /energy/:slug
 * Get a single plant's energy data by slug.
 */
router.get('/energy/:slug', async (req, res) => {
  try {
    var entry = await getEnergyBySlug(req.params.slug);
    if (!entry) return res.status(404).json({ error: 'Plant not found in energy database.' });
    return res.json({ status: 'ok', entry: entry });
  } catch (err) {
    console.error('Energy get failed:', err);
    return res.status(500).json({ error: 'Energy lookup failed.' });
  }
});

/**
 * POST /energy/bulk-upsert
 * Admin: add or update energy entries.
 * Body: { entries: [...], reviewedBy?: string }
 */
router.post('/energy/bulk-upsert', async (req, res) => {
  try {
    var body = req.body || {};
    var entries = Array.isArray(body.entries) ? body.entries : [];
    if (!entries.length) return res.status(400).json({ error: 'No entries provided.' });
    var result = await upsertEnergyEntries(entries, body.reviewedBy || 'admin-api');
    return res.json({ status: 'ok', updated: result.updated });
  } catch (err) {
    console.error('Energy bulk-upsert failed:', err);
    return res.status(500).json({ error: 'Bulk upsert failed.' });
  }
});

module.exports = router;
