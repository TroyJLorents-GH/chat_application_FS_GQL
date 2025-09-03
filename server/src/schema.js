const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String!
    createdAt: String!
    chatRooms: [ChatRoom!]!
  }

  type Group {
    id: ID!
    name: String!
    description: String
    icon: String
    chatRooms: [ChatRoom!]!
    roomCount: Int!
    createdAt: String!
  }

  type ChatRoom {
    id: ID!
    name: String!
    description: String
    group: Group!
    createdAt: String!
    members: [User!]!
    messages: [Message!]!
    messageCount: Int!
    lastActivity: String
    tags: [String!]
  }

  type Message {
    id: ID!
    text: String!
    createdAt: String!
    author: User!
    room: ChatRoom!
    tags: [String!]
  }

  type SearchResult {
    room: ChatRoom!
    relevance: Float!
    keywordMatches: [String!]!
    messageCount: Int!
  }

  type Topic {
    keyword: String!
    frequency: Int!
    rooms: [ChatRoom!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    users: [User!]!
    groups: [Group!]!
    group(id: ID!): Group
    chatRooms(groupId: ID): [ChatRoom!]!
    chatRoom(id: ID!): ChatRoom
    messages(roomId: ID!): [Message!]!
    searchMessages(keyword: String!, groupId: ID): [SearchResult!]!
    searchRooms(query: String!, groupId: ID): [ChatRoom!]!
    getPopularTopics(groupId: ID, limit: Int): [Topic!]!
  }

  type Mutation {
    signUp(email: String!, password: String!, name: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createGroup(name: String!, description: String, icon: String): Group!
    createChatRoom(name: String!, description: String, groupId: ID!, tags: [String!]): ChatRoom!
    joinChatRoom(roomId: ID!): ChatRoom!
    leaveChatRoom(roomId: ID!): ChatRoom!
    sendMessage(roomId: ID!, text: String!): Message!
  }

  type Subscription {
    messageAdded(roomId: ID!): Message!
    userJoinedRoom(roomId: ID!): User!
    userLeftRoom(roomId: ID!): User!
  }
`;

module.exports = typeDefs;
