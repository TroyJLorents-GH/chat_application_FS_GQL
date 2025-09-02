# 🚀 GraphQL Chat Application

A full-stack real-time chat application built with **GraphQL**, **React**, and **Apollo Client**. This project demonstrates all three pillars of GraphQL: **Queries**, **Mutations**, and **Subscriptions**.

## ✨ Features

- 🔐 **JWT Authentication** - User signup, login, and secure sessions
- 💬 **Real-time Messaging** - Live message updates using GraphQL subscriptions
- 🏠 **Chat Rooms** - Create and join different chat rooms
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎨 **Modern UI** - Beautiful interface built with Tailwind CSS
- ⚡ **Real-time Updates** - Instant message delivery and user presence
- 🔄 **Apollo Client** - Optimistic updates and cache management

## 🎯 What You'll Learn

This project covers all the essential GraphQL concepts:

### **GraphQL Fundamentals**
- **Schema Definition Language (SDL)** - Define types, queries, mutations, and subscriptions
- **Resolvers** - Implement the logic for each GraphQL operation
- **Type System** - Strong typing with User, ChatRoom, and Message types

### **GraphQL Operations**
- **Queries** - Fetch chat rooms, messages, and user data
- **Mutations** - Create users, rooms, and send messages
- **Subscriptions** - Real-time message updates using WebSockets

### **Full-Stack Integration**
- **Apollo Server** - GraphQL server with Express and WebSocket support
- **Apollo Client** - React integration with cache management
- **Real-time Features** - WebSocket subscriptions for live updates

## 🛠️ Tech Stack

### **Backend**
- **Node.js** + **Express** - Web server framework
- **Apollo Server** - GraphQL server implementation
- **GraphQL Subscriptions** - Real-time functionality
- **SQLite** - Database (easily upgradable to PostgreSQL)
- **JWT** - Authentication and authorization
- **WebSockets** - Real-time communication

### **Frontend**
- **React 18** - Modern React with hooks
- **Apollo Client** - GraphQL client with cache management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### 1. Install Dependencies
```bash
# Install all dependencies (root, server, and client)
npm run install-all
```

### 2. Start the Development Servers
```bash
# Start both backend and frontend
npm run dev
```

This will start:
- **Backend**: http://localhost:4000/graphql
- **Frontend**: http://localhost:3000

### 3. Open Your Browser
Navigate to [http://localhost:3000](http://localhost:3000) to see the chat application.

## 🔑 Demo Accounts

The app comes with pre-loaded demo accounts:
- **alice@example.com** (any password)
- **bob@example.com** (any password)  
- **charlie@example.com** (any password)

## 📁 Project Structure

```
graphql-chat-app/
├── server/                 # Backend GraphQL server
│   ├── src/
│   │   ├── schema.js      # GraphQL schema definition
│   │   ├── resolvers.js   # GraphQL resolvers
│   │   ├── database.js    # Database operations
│   │   └── index.js       # Server entry point
│   └── package.json
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── graphql/       # GraphQL operations
│   │   ├── apollo-client.js # Apollo Client config
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   └── package.json
└── package.json            # Root package.json
```

## 🔍 GraphQL Schema

```graphql
type User {
  id: ID!
  email: String!
  name: String!
  createdAt: String!
  chatRooms: [ChatRoom!]!
}

type ChatRoom {
  id: ID!
  name: String!
  description: String
  createdAt: String!
  members: [User!]!
  messages: [Message!]!
  messageCount: Int!
}

type Message {
  id: ID!
  text: String!
  createdAt: String!
  author: User!
  room: ChatRoom!
}

type Query {
  me: User
  chatRooms: [ChatRoom!]!
  chatRoom(id: ID!): ChatRoom
  messages(roomId: ID!): [Message!]!
}

type Mutation {
  signUp(email: String!, password: String!, name: String!): AuthPayload!
  login(email: String!, password: String!): String!
  createChatRoom(name: String!, description: String): ChatRoom!
  sendMessage(roomId: ID!, text: String!): Message!
}

type Subscription {
  messageAdded(roomId: ID!): Message!
}
```

## 🎓 Learning Path

### **Phase 1: Understanding the Basics**
1. Explore the GraphQL schema in `server/src/schema.js`
2. Understand how resolvers work in `server/src/resolvers.js`
3. See how the database layer connects in `server/src/database.js`

### **Phase 2: Frontend Integration**
1. Examine Apollo Client setup in `client/src/apollo-client.js`
2. Look at GraphQL operations in `client/src/graphql/operations.js`
3. See how components use `useQuery`, `useMutation`, and `useSubscription`

### **Phase 3: Real-time Features**
1. Understand WebSocket setup in the server
2. See how subscriptions work in the ChatRoom component
3. Explore the PubSub pattern for real-time updates

### **Phase 4: Advanced Concepts**
1. Study Apollo Client cache management
2. Understand optimistic updates
3. Explore error handling and loading states

## 🚀 Next Steps & Extensions

### **Immediate Enhancements**
- Add user typing indicators
- Implement message reactions
- Add file/image sharing
- Create private messaging

### **Advanced Features**
- **Sports Integration** - Use NBA API to create team-based chat rooms
- **Real-time Presence** - Show who's online in each room
- **Message Search** - Full-text search across messages
- **Push Notifications** - Browser and mobile notifications

### **Database Upgrades**
- Migrate from SQLite to PostgreSQL
- Add Redis for caching and session management
- Implement message pagination

## 🐛 Troubleshooting

### **Common Issues**

1. **Port conflicts**: Make sure ports 3000 and 4000 are available
2. **Database errors**: The SQLite database is created automatically
3. **Subscription issues**: Check that WebSocket connection is established
4. **CORS errors**: Backend is configured to allow frontend requests

### **Development Tips**

- Use the GraphQL Playground at `http://localhost:4000/graphql` to test queries
- Check browser console for Apollo Client errors
- Monitor server logs for backend issues
- Use React DevTools to inspect component state

## 📚 Resources

- [GraphQL Official Documentation](https://graphql.org/)
- [Apollo Server Documentation](https://www.apollographql.com/docs/apollo-server/)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [React Documentation](https://reactjs.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve this learning project!

## 📄 License

MIT License - feel free to use this code for learning and building your own projects.

---

**Happy coding! 🎉** 

This project demonstrates the power and flexibility of GraphQL for building modern, real-time applications. Use it as a foundation to explore more advanced GraphQL concepts and build your own amazing applications!
