const express = require('express');
const { diagnoseFromKnowledge } = require('../services/plantKnowledgeService');

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

module.exports = router;
