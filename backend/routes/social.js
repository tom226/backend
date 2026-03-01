const express = require('express');
const router = express.Router();
const { meta, mvp } = require('../config/social');
const SocialInteraction = require('../models/SocialInteraction');

// Meta webhook verification (GET)
router.get('/meta-webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === meta.verifyToken) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Meta webhook receiver (POST)
router.post('/meta-webhook', async (req, res) => {
  try {
    const body = req.body;

    if (body.object !== 'instagram') {
      return res.sendStatus(200);
    }

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'comments') {
          const comment = change.value || {};
          const text = (comment.text || '').toLowerCase();

          const matched = mvp.scanKeywords.some((kw) => text.includes(kw));
          if (!matched) continue;

          await SocialInteraction.create({
            platform: 'instagram',
            type: 'comment',
            igUserId: comment.from?.id,
            igUsername: comment.from?.username,
            igMediaId: comment.media?.id,
            igCommentId: comment.id,
            message: comment.text,
            tags: ['scan_interest'],
          });
        }
      }
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error('Meta webhook error', err);
    return res.sendStatus(500);
  }
});

module.exports = router;

