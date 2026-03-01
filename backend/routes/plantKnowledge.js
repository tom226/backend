const express = require('express');
const DiagnosisCase = require('../models/DiagnosisCase');
const {
  diagnoseFromKnowledge,
  searchKnowledge,
  upsertKnowledgeEntries,
  runDailyKnowledgeRefresh
} = require('../services/plantKnowledgeService');

const router = express.Router();

function isAdminAuthorized(req) {
  const token = req.headers['x-admin-token'];
  const configured = process.env.KNOWLEDGE_ADMIN_TOKEN;
  if (!configured) return false;
  return token && token === configured;
}

router.post('/diagnose', async (req, res) => {
  try {
    const payload = req.body || {};
    const result = await diagnoseFromKnowledge(payload);

    await DiagnosisCase.create({
      source: payload.source || 'manual-api',
      plantName: payload.plantName || 'unknown',
      query: payload.query || '',
      observedSymptoms: payload.symptoms || [],
      leafCondition: payload.leafCondition || {},
      soilCondition: payload.soilCondition || {},
      environment: payload.environment || {},
      verification: result.verification || {},
      result: {
        diseaseName: result.disease || '',
        confidence: result.confidence || 0,
        severity: result.severity || '',
        status: result.status,
        notes: result.message || '',
        solutionTitles: (result.remedies || []).map(item => item.name)
      }
    });

    return res.json(result);
  } catch (err) {
    console.error('Knowledge diagnosis failed:', err);
    return res.status(500).json({ error: 'Failed to diagnose from knowledge database.' });
  }
});

router.post('/chat-assist', async (req, res) => {
  try {
    const { query = '', context = {} } = req.body || {};
    const hits = await searchKnowledge(query, 3);

    if (!hits.length) {
      return res.json({
        answer: 'I need a bit more detail about leaf color, soil moisture, and sunlight to give an exact fix.',
        references: [],
        suggestions: ['Share leaf color and texture', 'Tell soil moisture and smell', 'Mention indoor/outdoor + sunlight hours']
      });
    }

    const best = hits[0];
    const diagnosis = await diagnoseFromKnowledge({
      ...context,
      query,
      symptoms: [...(context.symptoms || []), ...(best.symptoms || []).slice(0, 2)],
      source: 'chatbot'
    });

    const topSolution = diagnosis.remedies?.[0];
    const answer = topSolution
      ? `${best.diseaseName}: ${best.summary} Suggested fix: ${topSolution.name}. ${topSolution.steps}`
      : `${best.diseaseName}: ${best.summary}`;

    return res.json({
      answer,
      diagnosis,
      references: (best.references || []).slice(0, 3)
    });
  } catch (err) {
    console.error('Knowledge chat assist failed:', err);
    return res.status(500).json({ error: 'Failed to generate chatbot guidance.' });
  }
});

router.get('/references', async (req, res) => {
  try {
    const query = String(req.query.q || '').trim();
    const hits = await searchKnowledge(query, 10);

    const references = hits.flatMap(item =>
      (item.references || []).map(ref => ({
        disease: item.diseaseName,
        title: ref.title,
        url: ref.url,
        source: ref.source,
        lastCheckedAt: ref.lastCheckedAt || item.verification?.lastVerifiedAt
      }))
    );

    return res.json({ count: references.length, references });
  } catch (err) {
    console.error('Fetch references failed:', err);
    return res.status(500).json({ error: 'Failed to fetch references.' });
  }
});

router.post('/upsert', async (req, res) => {
  try {
    if (!isAdminAuthorized(req)) {
      return res.status(401).json({ error: 'Unauthorized. Missing or invalid admin token.' });
    }

    const entries = req.body?.entries;
    const result = await upsertKnowledgeEntries(entries, 'admin-api');
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error('Knowledge upsert failed:', err);
    return res.status(500).json({ error: 'Failed to upsert knowledge entries.' });
  }
});

router.post('/daily-refresh', async (req, res) => {
  try {
    if (!isAdminAuthorized(req)) {
      return res.status(401).json({ error: 'Unauthorized. Missing or invalid admin token.' });
    }

    const result = await runDailyKnowledgeRefresh();
    return res.json(result);
  } catch (err) {
    console.error('Manual daily refresh failed:', err);
    return res.status(500).json({ error: 'Failed to run daily refresh.' });
  }
});

module.exports = router;
