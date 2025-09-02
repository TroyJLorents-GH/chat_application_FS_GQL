const { PubSub } = require('graphql-subscriptions');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');

const pubsub = new PubSub();

const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return await db.getUserById(user.id);
    },
    
    users: async () => {
      return await db.getAllUsers();
    },
    
    chatRooms: async () => {
      return await db.getAllChatRooms();
    },
    
    chatRoom: async (_, { id }) => {
      return await db.getChatRoomById(id);
    },
    
    messages: async (_, { roomId }) => {
      return await db.getMessagesByRoomId(roomId);
    }
  },

  Mutation: {
    signUp: async (_, { email, password, name }) => {
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await db.createUser({
        id: uuidv4(),
        email,
        name,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      });

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '7d'
      });

      return { token, user };
    },

    login: async (_, { email, password }) => {
      const user = await db.getUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid password');
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '7d'
      });

      return { token, user };
    },

    createChatRoom: async (_, { name, description }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const room = await db.createChatRoom({
        id: uuidv4(),
        name,
        description,
        createdAt: new Date().toISOString()
      });

      // Add creator as member
      await db.addUserToRoom(user.id, room.id);
      
      pubsub.publish('USER_JOINED_ROOM', {
        userJoinedRoom: await db.getUserById(user.id)
      });

      return room;
    },

    joinChatRoom: async (_, { roomId }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      await db.addUserToRoom(user.id, roomId);
      
      pubsub.publish('USER_JOINED_ROOM', {
        userJoinedRoom: await db.getUserById(user.id)
      });

      return await db.getChatRoomById(roomId);
    },

    leaveChatRoom: async (_, { roomId }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      await db.removeUserFromRoom(user.id, roomId);
      
      pubsub.publish('USER_LEFT_ROOM', {
        userLeftRoom: await db.getUserById(user.id)
      });

      return await db.getChatRoomById(roomId);
    },

    sendMessage: async (_, { roomId, text }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const message = await db.createMessage({
        id: uuidv4(),
        text,
        authorId: user.id,
        roomId,
        createdAt: new Date().toISOString()
      });

      // Publish to subscription
      pubsub.publish('MESSAGE_ADDED', {
        messageAdded: message
      });

      return message;
    }
  },

  Subscription: {
    messageAdded: {
      subscribe: () => pubsub.asyncIterator(['MESSAGE_ADDED'])
    },
    userJoinedRoom: {
      subscribe: () => pubsub.asyncIterator(['USER_JOINED_ROOM'])
    },
    userLeftRoom: {
      subscribe: () => pubsub.asyncIterator(['USER_LEFT_ROOM'])
    }
  },

  User: {
    chatRooms: async (parent) => {
      return await db.getChatRoomsByUserId(parent.id);
    }
  },

  ChatRoom: {
    members: async (parent) => {
      return await db.getUsersByRoomId(parent.id);
    },
    messages: async (parent) => {
      return await db.getMessagesByRoomId(parent.id);
    },
    messageCount: async (parent) => {
      const messages = await db.getMessagesByRoomId(parent.id);
      return messages.length;
    }
  },

  Message: {
    author: async (parent) => {
      return await db.getUserById(parent.authorId);
    },
    room: async (parent) => {
      return await db.getChatRoomById(parent.roomId);
    }
  }
};

module.exports = resolvers;
