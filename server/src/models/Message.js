const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Update room's lastActivity when message is created
messageSchema.post('save', async function() {
  const ChatRoom = mongoose.model('ChatRoom');
  await ChatRoom.findByIdAndUpdate(this.room, { lastActivity: new Date() });
});

module.exports = mongoose.model('Message', messageSchema);
