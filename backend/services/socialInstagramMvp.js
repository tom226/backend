const axios = require('axios');
const { meta, mvp } = require('../config/social');
const SocialInteraction = require('../models/SocialInteraction');
const mongoose = require('mongoose');

async function sendInstagramDm(igUserId, text) {
  const url = `https://graph.facebook.com/v18.0/${meta.igBusinessId}/messages`;

  await axios.post(
    url,
    {
      recipient: { id: igUserId },
      message: { text },
      messaging_type: 'RESPONSE',
    },
    { params: { access_token: meta.pageAccessToken } }
  );
}

async function processPendingInteractions() {
  if (!meta.igBusinessId || !meta.pageAccessToken) {
    return;
  }

  const pending = await SocialInteraction.find({
    platform: 'instagram',
    type: 'comment',
    autoReplied: false,
  })
    .sort({ createdAt: 1 })
    .limit(20);

  for (const interaction of pending) {
    if (!interaction.igUserId) {
      interaction.autoReplyStatus = 'failed';
      interaction.autoReplied = true;
      await interaction.save();
      continue;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const countToday = await SocialInteraction.countDocuments({
      platform: 'instagram',
      type: 'dm',
      igUserId: interaction.igUserId,
      createdAt: { $gte: today },
    });

    if (countToday >= mvp.autoReplyLimitPerUserPerDay) {
      interaction.autoReplyStatus = 'failed';
      interaction.autoReplied = true;
      await interaction.save();
      continue;
    }

    const replyText =
      'Hey plant parent 🌱 Thanks for reaching out! ' +
      `You can scan your plant in under a minute here: ${mvp.scannerUrl} ` +
      'Upload a clear photo and we’ll guide you step by step.';

    try {
      await sendInstagramDm(interaction.igUserId, replyText);

      interaction.autoReplyText = replyText;
      interaction.autoReplyStatus = 'sent';
      interaction.autoReplied = true;
      await interaction.save();

      await SocialInteraction.create({
        platform: 'instagram',
        type: 'dm',
        igUserId: interaction.igUserId,
        igUsername: interaction.igUsername,
        message: replyText,
        tags: ['scan_link_sent'],
        autoReplied: true,
        autoReplyText: replyText,
        autoReplyStatus: 'sent',
      });
    } catch (err) {
      console.error('Failed to send IG DM', err.response?.data || err.message);
      interaction.autoReplyStatus = 'failed';
      interaction.autoReplied = true;
      await interaction.save();
    }
  }
}

module.exports = { processPendingInteractions };

