const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'chat.db');
const db = new sqlite3.Database(dbPath);

// Create tables
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          password TEXT NOT NULL,
          createdAt TEXT NOT NULL
        )
      `);

      // Chat rooms table
      db.run(`
        CREATE TABLE IF NOT EXISTS chat_rooms (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          createdAt TEXT NOT NULL
        )
      `);

      // Messages table
      db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          text TEXT NOT NULL,
          authorId TEXT NOT NULL,
          roomId TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          FOREIGN KEY (authorId) REFERENCES users (id),
          FOREIGN KEY (roomId) REFERENCES chat_rooms (id)
        )
      `);

      // Room members table (many-to-many relationship)
      db.run(`
        CREATE TABLE IF NOT EXISTS room_members (
          userId TEXT NOT NULL,
          roomId TEXT NOT NULL,
          joinedAt TEXT NOT NULL,
          PRIMARY KEY (userId, roomId),
          FOREIGN KEY (userId) REFERENCES users (id),
          FOREIGN KEY (roomId) REFERENCES chat_rooms (id)
        )
      `);

      // Insert some sample data
      db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (row.count === 0) {
          // Create proper bcrypt hashes for demo passwords
          const bcrypt = require('bcryptjs');
          const sampleUsers = [
            ['1', 'alice@example.com', 'Alice Johnson', bcrypt.hashSync('password123', 10), new Date().toISOString()],
            ['2', 'bob@example.com', 'Bob Smith', bcrypt.hashSync('password123', 10), new Date().toISOString()],
            ['3', 'charlie@example.com', 'Charlie Brown', bcrypt.hashSync('password123', 10), new Date().toISOString()]
          ];
          
          const insertUser = db.prepare('INSERT INTO users (id, email, name, password, createdAt) VALUES (?, ?, ?, ?, ?)');
          sampleUsers.forEach(user => insertUser.run(user));
          insertUser.finalize();

          // Create sample chat rooms
          const sampleRooms = [
            ['1', 'General Chat', 'A place for general discussion', new Date().toISOString()],
            ['2', 'Tech Talk', 'Discuss the latest in technology', new Date().toISOString()],
            ['3', 'Sports Fanatics', 'All things sports!', new Date().toISOString()]
          ];
          
          const insertRoom = db.prepare('INSERT INTO chat_rooms (id, name, description, createdAt) VALUES (?, ?, ?, ?)');
          sampleRooms.forEach(room => insertRoom.run(room));
          insertRoom.finalize();

          // Add users to rooms
          const sampleMembers = [
            ['1', '1', new Date().toISOString()], // Alice in General
            ['2', '1', new Date().toISOString()], // Bob in General
            ['1', '2', new Date().toISOString()], // Alice in Tech
            ['3', '2', new Date().toISOString()], // Charlie in Tech
            ['2', '3', new Date().toISOString()], // Bob in Sports
            ['3', '3', new Date().toISOString()]  // Charlie in Sports
          ];
          
          const insertMember = db.prepare('INSERT INTO room_members (userId, roomId, joinedAt) VALUES (?, ?, ?)');
          sampleMembers.forEach(member => insertMember.run(member));
          insertMember.finalize();

          // Add some sample messages
          const sampleMessages = [
            ['1', 'Hey everyone! Welcome to General Chat!', '1', '1', new Date().toISOString()],
            ['2', 'Thanks Alice! This looks great!', '2', '1', new Date().toISOString()],
            ['3', 'Anyone interested in the latest React updates?', '1', '2', new Date().toISOString()],
            ['4', 'Yes! The new hooks are amazing!', '3', '2', new Date().toISOString()],
            ['5', 'Go Lakers! 🏀', '2', '3', new Date().toISOString()],
            ['6', 'Warriors fan here! 💪', '3', '3', new Date().toISOString()]
          ];
          
          const insertMessage = db.prepare('INSERT INTO messages (id, text, authorId, roomId, createdAt) VALUES (?, ?, ?, ?, ?)');
          sampleMessages.forEach(message => insertMessage.run(message));
          insertMessage.finalize();
        }
        
        resolve();
      });
    });
  });
};

// Database operations
const database = {
  // User operations
  createUser: (userData) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (id, email, name, password, createdAt) VALUES (?, ?, ?, ?, ?)',
        [userData.id, userData.email, userData.name, userData.password, userData.createdAt],
        function(err) {
          if (err) reject(err);
          else resolve({ ...userData });
        }
      );
    });
  },

  getUserById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  getUserByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  getAllUsers: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM users ORDER BY createdAt DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Chat room operations
  createChatRoom: (roomData) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO chat_rooms (id, name, description, createdAt) VALUES (?, ?, ?, ?)',
        [roomData.id, roomData.name, roomData.description, roomData.createdAt],
        function(err) {
          if (err) reject(err);
          else resolve({ ...roomData });
        }
      );
    });
  },

  getChatRoomById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM chat_rooms WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  getAllChatRooms: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM chat_rooms ORDER BY createdAt DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Message operations
  createMessage: (messageData) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO messages (id, text, authorId, roomId, createdAt) VALUES (?, ?, ?, ?, ?)',
        [messageData.id, messageData.text, messageData.authorId, messageData.roomId, messageData.createdAt],
        function(err) {
          if (err) reject(err);
          else resolve({ ...messageData });
        }
      );
    });
  },

  getMessagesByRoomId: (roomId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM messages WHERE roomId = ? ORDER BY createdAt ASC', [roomId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Room membership operations
  addUserToRoom: (userId, roomId) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT OR IGNORE INTO room_members (userId, roomId, joinedAt) VALUES (?, ?, ?)',
        [userId, roomId, new Date().toISOString()],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  },

  removeUserFromRoom: (userId, roomId) => {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM room_members WHERE userId = ? AND roomId = ?',
        [userId, roomId],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  },

  getUsersByRoomId: (roomId) => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT u.* FROM users u JOIN room_members rm ON u.id = rm.userId WHERE rm.roomId = ?',
        [roomId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  getChatRoomsByUserId: (userId) => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT cr.* FROM chat_rooms cr JOIN room_members rm ON cr.id = rm.roomId WHERE rm.userId = ?',
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  // Initialize database
  init: initDatabase
};

module.exports = database;
