const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    required: true,
    enum: ['like', 'comment', 'follow', 'badge', 'expert-answer', 'challenge', 'streak', 'level-up', 'mention', 'scan-reply']
  },
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  fromUserName: { type: String, default: '' },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityPost', default: null },
  message: { type: String, required: true },
  icon: { type: String, default: '🔔' },
  read: { type: Boolean, default: false },
  actionUrl: { type: String, default: '' }
}, { timestamps: true });

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
