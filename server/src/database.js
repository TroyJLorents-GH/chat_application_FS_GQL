const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'chat.db');
const db = new sqlite3.Database(dbPath);

// Create tables
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Drop existing tables to ensure clean schema
      db.run('DROP TABLE IF EXISTS room_members');
      db.run('DROP TABLE IF EXISTS messages');
      db.run('DROP TABLE IF EXISTS chat_rooms');
      db.run('DROP TABLE IF EXISTS groups');
      db.run('DROP TABLE IF EXISTS users');
      
      // Groups table
      db.run(`
        CREATE TABLE IF NOT EXISTS groups (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          icon TEXT,
          createdAt TEXT NOT NULL
        )
      `);

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
          groupId TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          lastActivity TEXT,
          tags TEXT,
          FOREIGN KEY (groupId) REFERENCES groups (id)
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

          // Create sample groups
          const sampleGroups = [
            ['1', 'Tech', 'Technology discussions and development', '💻', new Date().toISOString()],
            ['2', 'Sports', 'All things sports and athletics', '⚽', new Date().toISOString()],
            ['3', 'Current News', 'Latest news and current events', '📰', new Date().toISOString()],
            ['4', 'Music', 'Music discussions and recommendations', '🎵', new Date().toISOString()],
            ['5', 'Gambling/Betting', 'Sports betting and gambling discussions', '🎲', new Date().toISOString()],
            ['6', 'Art', 'Art discussions and creative works', '🎨', new Date().toISOString()]
          ];
          
          const insertGroup = db.prepare('INSERT INTO groups (id, name, description, icon, createdAt) VALUES (?, ?, ?, ?, ?)');
          sampleGroups.forEach(group => insertGroup.run(group));
          insertGroup.finalize();

                      // Create sample chat rooms organized by groups
            const sampleRooms = [
              // Tech Group
              ['1', 'React Development', 'React.js discussions and help', '1', new Date().toISOString(), new Date().toISOString(), 'react,frontend,development'],
              ['2', 'Node.js Backend', 'Backend development with Node.js', '1', new Date().toISOString(), new Date().toISOString(), 'nodejs,backend,api'],
              ['3', 'GraphQL Discussions', 'GraphQL implementation and best practices', '1', new Date().toISOString(), new Date().toISOString(), 'graphql,api,development'],
              
              // Sports Group
              ['4', 'Lakers Fan Club', 'Los Angeles Lakers discussions', '2', new Date().toISOString(), new Date().toISOString(), 'lakers,nba,basketball'],
              ['5', 'NBA General', 'General NBA discussions', '2', new Date().toISOString(), new Date().toISOString(), 'nba,basketball'],
              ['6', 'Football Talk', 'American football discussions', '2', new Date().toISOString(), new Date().toISOString(), 'football,nfl'],
              
              // Gambling/Betting Group
              ['7', 'Sports Betting', 'Sports betting strategies and tips', '5', new Date().toISOString(), new Date().toISOString(), 'betting,sports,odds'],
              ['8', 'Parlays', 'Parlay betting discussions and strategies', '5', new Date().toISOString(), new Date().toISOString(), 'parlays,betting,strategy'],
              ['9', 'Casino Games', 'Casino game strategies and discussions', '5', new Date().toISOString(), new Date().toISOString(), 'casino,games,strategy'],
              
              // Current News Group
              ['10', 'Politics', 'Political discussions and news', '3', new Date().toISOString(), new Date().toISOString(), 'politics,news,government'],
              ['11', 'Technology News', 'Latest technology news and updates', '3', new Date().toISOString(), new Date().toISOString(), 'tech,news,innovation'],
              
              // Music Group
              ['12', 'Rock & Roll', 'Rock music discussions', '4', new Date().toISOString(), new Date().toISOString(), 'rock,music,classic'],
              ['13', 'Hip Hop', 'Hip hop music and culture', '4', new Date().toISOString(), new Date().toISOString(), 'hiphop,rap,music'],
              
              // Art Group
              ['14', 'Digital Art', 'Digital art and design discussions', '6', new Date().toISOString(), new Date().toISOString(), 'digital,art,design'],
              ['15', 'Traditional Art', 'Traditional art techniques and discussions', '6', new Date().toISOString(), new Date().toISOString(), 'traditional,art,painting']
            ];
          
          const insertRoom = db.prepare('INSERT INTO chat_rooms (id, name, description, groupId, createdAt, lastActivity, tags) VALUES (?, ?, ?, ?, ?, ?, ?)');
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

  // Group operations
  createGroup: (groupData) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO groups (id, name, description, icon, createdAt) VALUES (?, ?, ?, ?, ?)',
        [groupData.id, groupData.name, groupData.description, groupData.icon, groupData.createdAt],
        function(err) {
          if (err) reject(err);
          else resolve({ ...groupData });
        }
      );
    });
  },

  getGroupById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM groups WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  getAllGroups: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM groups ORDER BY name ASC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Chat room operations
  createChatRoom: (roomData) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO chat_rooms (id, name, description, groupId, createdAt, lastActivity, tags) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [roomData.id, roomData.name, roomData.description, roomData.groupId, roomData.createdAt, roomData.lastActivity, roomData.tags],
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

  getAllChatRooms: (groupId = null) => {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT cr.*, g.name as groupName, g.icon as groupIcon, g.description as groupDescription,
               (SELECT COUNT(*) FROM messages WHERE roomId = cr.id) as messageCount,
               (SELECT COUNT(*) FROM room_members WHERE roomId = cr.id) as memberCount
        FROM chat_rooms cr
        JOIN groups g ON cr.groupId = g.id
      `;
      
      const params = [];
      if (groupId) {
        query += ' WHERE cr.groupId = ?';
        params.push(groupId);
      }
      
      query += ' ORDER BY cr.lastActivity DESC, cr.createdAt DESC';
      
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  getChatRoomsByGroup: (groupId) => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT cr.*, g.name as groupName, g.icon as groupIcon,
               (SELECT COUNT(*) FROM messages WHERE roomId = cr.id) as messageCount,
               (SELECT COUNT(*) FROM room_members WHERE roomId = cr.id) as memberCount
        FROM chat_rooms cr
        JOIN groups g ON cr.groupId = g.id
        WHERE cr.groupId = ?
        ORDER BY cr.lastActivity DESC, cr.createdAt DESC
      `, [groupId], (err, rows) => {
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

  // Search operations
  searchMessages: (keyword, groupId = null) => {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT cr.*, g.name as groupName, g.icon as groupIcon,
               (SELECT COUNT(*) FROM messages WHERE roomId = cr.id) as messageCount,
               (SELECT COUNT(*) FROM room_members WHERE roomId = cr.id) as memberCount,
               (SELECT COUNT(*) FROM messages m WHERE m.roomId = cr.id AND m.text LIKE ?) as keywordMatches
        FROM chat_rooms cr
        JOIN groups g ON cr.groupId = g.id
        WHERE EXISTS (
          SELECT 1 FROM messages m 
          WHERE m.roomId = cr.id 
          AND m.text LIKE ?
        )
      `;
      
      const searchTerm = `%${keyword}%`;
      const params = [searchTerm, searchTerm];
      
      if (groupId) {
        query += ' AND cr.groupId = ?';
        params.push(groupId);
      }
      
      query += ' ORDER BY keywordMatches DESC, cr.lastActivity DESC';
      
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  searchRooms: (query, groupId = null) => {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT cr.*, g.name as groupName, g.icon as groupIcon,
               (SELECT COUNT(*) FROM messages WHERE roomId = cr.id) as messageCount,
               (SELECT COUNT(*) FROM room_members WHERE roomId = cr.id) as memberCount
        FROM chat_rooms cr
        JOIN groups g ON cr.groupId = g.id
        WHERE (cr.name LIKE ? OR cr.description LIKE ? OR cr.tags LIKE ?)
      `;
      
      const searchTerm = `%${query}%`;
      const params = [searchTerm, searchTerm, searchTerm];
      
      if (groupId) {
        sql += ' AND cr.groupId = ?';
        params.push(groupId);
      }
      
      sql += ' ORDER BY cr.lastActivity DESC, cr.createdAt DESC';
      
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  getPopularTopics: (groupId = null, limit = 10) => {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          m.text as keyword,
          COUNT(*) as frequency,
          GROUP_CONCAT(DISTINCT cr.id) as roomIds
        FROM messages m
        JOIN chat_rooms cr ON m.roomId = cr.id
        JOIN groups g ON cr.groupId = g.id
        WHERE m.text LIKE '%#%'
      `;
      
      const params = [];
      if (groupId) {
        query += ' AND cr.groupId = ?';
        params.push(groupId);
      }
      
      query += `
        GROUP BY m.text
        ORDER BY frequency DESC
        LIMIT ?
      `;
      params.push(limit);
      
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
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
