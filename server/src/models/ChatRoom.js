const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastActivity when messages are added
chatRoomSchema.methods.updateLastActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
