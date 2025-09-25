const mongoose = require('mongoose');
const User = require('./models/User');
const Group = require('./models/Group');
const ChatRoom = require('./models/ChatRoom');
const Message = require('./models/Message');
const RoomMember = require('./models/RoomMember');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app';
    console.log('🔗 Connecting to MongoDB...');
    console.log('📍 URI:', mongoURI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Initialize sample data
const initSampleData = async () => {
  try {
    // Check if data already exists
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      // Ensure existing users have hashed passwords (early runs may have stored plaintext)
      const existingUsers = await User.find();
      let fixedCount = 0;
      for (const user of existingUsers) {
        const looksHashed = typeof user.password === 'string' && user.password.startsWith('$2');
        if (!looksHashed) {
          // Re-set a default password and allow pre-save to hash it
          user.password = 'password123';
          await user.save();
          fixedCount += 1;
        }
      }
      if (fixedCount > 0) {
        console.log(`🔐 Updated ${fixedCount} user password(s) to hashed values`);
        console.log('📱 Sample users you can login with:');
        console.log('   - alice@example.com (password: password123)');
        console.log('   - bob@example.com (password: password123)');
        console.log('   - charlie@example.com (password: password123)');
      } else {
        console.log('📊 Sample data already exists, skipping initialization');
      }
      return;
    }

    console.log('🚀 Initializing sample data...');

    // Create sample groups
    const groups = await Group.insertMany([
      { name: 'Tech', description: 'Technology discussions and development', icon: '💻' },
      { name: 'Sports', description: 'All things sports and athletics', icon: '⚽' },
      { name: 'Current News', description: 'Latest news and current events', icon: '📰' },
      { name: 'Music', description: 'Music discussions and recommendations', icon: '🎵' },
      { name: 'Gambling/Betting', description: 'Sports betting and gambling discussions', icon: '🎲' },
      { name: 'Art', description: 'Art discussions and creative works', icon: '🎨' }
    ]);

    // Create sample users (use create to trigger pre-save hashing)
    const users = await User.create([
      { email: 'alice@example.com', name: 'Alice Johnson', password: 'password123' },
      { email: 'bob@example.com', name: 'Bob Smith', password: 'password123' },
      { email: 'charlie@example.com', name: 'Charlie Brown', password: 'password123' }
    ]);

    // Create sample chat rooms
    const rooms = await ChatRoom.insertMany([
      // Tech Group
      { name: 'React Development', description: 'React.js discussions and help', group: groups[0]._id, tags: ['react', 'frontend', 'development'] },
      { name: 'Node.js Backend', description: 'Backend development with Node.js', group: groups[0]._id, tags: ['nodejs', 'backend', 'api'] },
      { name: 'GraphQL Discussions', description: 'GraphQL implementation and best practices', group: groups[0]._id, tags: ['graphql', 'api', 'development'] },
      
      // Sports Group
      { name: 'Lakers Fan Club', description: 'Los Angeles Lakers discussions', group: groups[1]._id, tags: ['lakers', 'nba', 'basketball'] },
      { name: 'NBA General', description: 'General NBA discussions', group: groups[1]._id, tags: ['nba', 'basketball'] },
      { name: 'Football Talk', description: 'American football discussions', group: groups[1]._id, tags: ['football', 'nfl'] },
      
      // Gambling/Betting Group
      { name: 'Sports Betting', description: 'Sports betting strategies and tips', group: groups[4]._id, tags: ['betting', 'sports', 'odds'] },
      { name: 'Parlays', description: 'Parlay betting discussions and strategies', group: groups[4]._id, tags: ['parlays', 'betting', 'strategy'] },
      { name: 'Casino Games', description: 'Casino game strategies and discussions', group: groups[4]._id, tags: ['casino', 'games', 'strategy'] },
      
      // Current News Group
      { name: 'Politics', description: 'Political discussions and news', group: groups[2]._id, tags: ['politics', 'news', 'government'] },
      { name: 'Technology News', description: 'Latest technology news and updates', group: groups[2]._id, tags: ['tech', 'news', 'innovation'] },
      
      // Music Group
      { name: 'Rock & Roll', description: 'Rock music discussions', group: groups[3]._id, tags: ['rock', 'music', 'classic'] },
      { name: 'Hip Hop', description: 'Hip hop music and culture', group: groups[3]._id, tags: ['hiphop', 'rap', 'music'] },
      
      // Art Group
      { name: 'Digital Art', description: 'Digital art and design discussions', group: groups[5]._id, tags: ['digital', 'art', 'design'] },
      { name: 'Traditional Art', description: 'Traditional art techniques and discussions', group: groups[5]._id, tags: ['traditional', 'art', 'painting'] }
    ]);

    // Add users to rooms
    await RoomMember.insertMany([
      { user: users[0]._id, room: rooms[0]._id }, // Alice in React Development
      { user: users[1]._id, room: rooms[0]._id }, // Bob in React Development
      { user: users[0]._id, room: rooms[1]._id }, // Alice in Node.js Backend
      { user: users[2]._id, room: rooms[1]._id }, // Charlie in Node.js Backend
      { user: users[1]._id, room: rooms[3]._id }, // Bob in Lakers Fan Club
      { user: users[2]._id, room: rooms[3]._id }  // Charlie in Lakers Fan Club
    ]);

    // Add some sample messages
    await Message.insertMany([
      { text: 'Hey everyone! Welcome to React Development!', author: users[0]._id, room: rooms[0]._id },
      { text: 'Thanks Alice! This looks great!', author: users[1]._id, room: rooms[0]._id },
      { text: 'Anyone interested in the latest React updates?', author: users[0]._id, room: rooms[1]._id },
      { text: 'Yes! The new hooks are amazing!', author: users[2]._id, room: rooms[1]._id },
      { text: 'Go Lakers! 🏀', author: users[1]._id, room: rooms[3]._id },
      { text: 'Warriors fan here! 💪', author: users[2]._id, room: rooms[3]._id }
    ]);

    console.log('✅ Sample data initialized successfully');
    console.log('📱 Sample users you can login with:');
    console.log('   - alice@example.com (password: password123)');
    console.log('   - bob@example.com (password: password123)');
    console.log('   - charlie@example.com (password: password123)');
  } catch (error) {
    console.error('❌ Error initializing sample data:', error);
  }
};

// Database operations
const database = {
  // User operations
  createUser: async (userData) => {
    const user = new User(userData);
    return await user.save();
  },

  getUserById: async (id) => {
    return await User.findById(id).select('-password');
  },

  getUserByEmail: async (email) => {
    return await User.findOne({ email: email.toLowerCase() });
  },

  getAllUsers: async () => {
    return await User.find().select('-password');
  },

  // Group operations
  createGroup: async (groupData) => {
    const group = new Group(groupData);
    return await group.save();
  },

  getGroupById: async (id) => {
    return await Group.findById(id);
  },

  getAllGroups: async () => {
    return await Group.find().sort({ name: 1 });
  },

  // Chat room operations
  createChatRoom: async (roomData) => {
    const room = new ChatRoom(roomData);
    return await room.save();
  },

  getChatRoomById: async (id) => {
    return await ChatRoom.findById(id)
      .populate('group')
      .populate({
        path: 'messages',
        populate: {
          path: 'author',
          select: 'name email'
        },
        options: { sort: { createdAt: 1 } }
      })
      .populate({
        path: 'members',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });
  },

  getAllChatRooms: async (groupId = null) => {
    const query = groupId ? { group: groupId } : {};
    return await ChatRoom.find(query)
      .populate('group')
      .populate({
        path: 'messages',
        options: { sort: { createdAt: -1 }, limit: 1 }
      })
      .populate({
        path: 'members',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .sort({ lastActivity: -1, createdAt: -1 });
  },

  getChatRoomsByGroup: async (groupId) => {
    return await ChatRoom.find({ group: groupId })
      .populate('group')
      .populate({
        path: 'messages',
        options: { sort: { createdAt: -1 }, limit: 1 }
      })
      .populate({
        path: 'members',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .sort({ lastActivity: -1, createdAt: -1 });
  },

  getChatRoomsByUserId: async (userId) => {
    const memberships = await RoomMember.find({ user: userId }).populate('room');
    return memberships.map(membership => membership.room);
  },

  // Message operations
  createMessage: async (messageData) => {
    const message = new Message(messageData);
    return await message.save();
  },

  getMessagesByRoomId: async (roomId) => {
    return await Message.find({ room: roomId })
      .populate('author', 'name email')
      .sort({ createdAt: 1 });
  },

  searchMessages: async (keyword, groupId = null) => {
    const query = { text: { $regex: keyword, $options: 'i' } };
    if (groupId) {
      const rooms = await ChatRoom.find({ group: groupId }).select('_id');
      query.room = { $in: rooms.map(room => room._id) };
    }
    
    return await Message.find(query)
      .populate('author', 'name email')
      .populate('room', 'name group')
      .sort({ createdAt: -1 });
  },

  // Room member operations
  joinChatRoom: async (userId, roomId) => {
    try {
      const membership = new RoomMember({ user: userId, room: roomId });
      return await membership.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('User is already a member of this room');
      }
      throw error;
    }
  },

  leaveChatRoom: async (userId, roomId) => {
    return await RoomMember.findOneAndDelete({ user: userId, room: roomId });
  },

  // Search operations
  searchRooms: async (query, groupId = null) => {
    const searchQuery = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };
    
    if (groupId) {
      searchQuery.group = groupId;
    }
    
    return await ChatRoom.find(searchQuery)
      .populate('group')
      .populate({
        path: 'members',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .sort({ lastActivity: -1 });
  },

  getPopularTopics: async (groupId = null, limit = 10) => {
    const pipeline = [
      { $match: groupId ? { group: mongoose.Types.ObjectId(groupId) } : {} },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 }, rooms: { $addToSet: '$_id' } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { keyword: '$_id', frequency: '$count', rooms: 1, _id: 0 } }
    ];
    
    return await ChatRoom.aggregate(pipeline);
  }
};

module.exports = {
  connectDB,
  initSampleData,
  database
};
