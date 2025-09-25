const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const { connectDB, initSampleData, database: db } = require('./mongodb');

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({
  origin: ['http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Test endpoint to verify server is running
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    websocket: 'ws://localhost:4001/graphql'
  });
});

// JWT Authentication middleware
const authenticateUser = async (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      const user = await db.getUserById(decoded.id);
      return user;
    } catch (error) {
      return null;
    }
  }
  return null;
};

// Create GraphQL schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create Apollo Server
const server = new ApolloServer({
  schema,
  context: async ({ req, connection }) => {
    if (connection) {
      // Subscription context
      return connection.context;
    }
    
    // HTTP context
    const user = await authenticateUser(req);
    return { user };
  },
  plugins: [
    {
      async serverWillStart() {
        console.log('🚀 Apollo Server starting up...');
      },
    },
  ],
});

// WebSocket server for subscriptions
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

// Add basic WebSocket event handlers for debugging
wsServer.on('connection', (socket, request) => {
  console.log('🔌 WebSocket connection established');
  
  socket.on('message', (message) => {
    console.log('📨 WebSocket message received:', message.toString());
  });
  
  socket.on('close', () => {
    console.log('🔌 WebSocket connection closed');
  });
  
  socket.on('error', (error) => {
    console.log('❌ WebSocket error:', error);
  });
});

// Set up WebSocket server
useServer(
  {
    schema,
    context: async (ctx) => {
      // Handle authentication for subscriptions
      const token = ctx.connectionParams?.authorization;
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
          const user = await db.getUserById(decoded.id);
          return { user };
        } catch (error) {
          return { user: null };
        }
      }
      return { user: null };
    },
    onConnect: (ctx) => {
      console.log('🔌 GraphQL WebSocket client connected');
    },
    onDisconnect: (ctx) => {
      console.log('🔌 GraphQL WebSocket client disconnected');
    },
  },
  wsServer
);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Initialize sample data
    await initSampleData();

    // Start Apollo Server
    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });

    // Start HTTP server
    const PORT = process.env.PORT || 4001;
    httpServer.listen(PORT, () => {
      console.log(`🚀 GraphQL server ready at http://localhost:${PORT}${server.graphqlPath}`);
      console.log(`🔌 WebSocket server ready at ws://localhost:${PORT}/graphql`);
      console.log(`📱 Sample users you can login with:`);
      console.log(`   - alice@example.com (password: password123)`);
      console.log(`   - bob@example.com (password: password123)`);
      console.log(`   - charlie@example.com (password: password123)`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

startServer();
