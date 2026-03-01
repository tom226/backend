const mongoose = require('mongoose');

const SocialInteractionSchema = new mongoose.Schema(
  {
    platform: { type: String, enum: ['instagram'], required: true },
    type: { type: String, enum: ['comment', 'dm'], required: true },
    igUserId: String,
    igUsername: String,
    igMediaId: String,
    igCommentId: String,
    message: String,
    tags: [String],
    autoReplied: { type: Boolean, default: false },
    autoReplyText: String,
    autoReplyStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SocialInteraction', SocialInteractionSchema);

