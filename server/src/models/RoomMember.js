const mongoose = require('mongoose');

const roomMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true
  }
}, {
  timestamps: true
});

// Ensure unique user-room combinations
roomMemberSchema.index({ user: 1, room: 1 }, { unique: true });

module.exports = mongoose.model('RoomMember', roomMemberSchema);
