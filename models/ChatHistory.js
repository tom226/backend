const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{
    user: { type: String },
    bot: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
module.exports = { ChatHistory };
