const { gql } = require('apollo-server-express');

const typeDefs = gql`
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

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    users: [User!]!
    chatRooms: [ChatRoom!]!
    chatRoom(id: ID!): ChatRoom
    messages(roomId: ID!): [Message!]!
  }

  type Mutation {
    signUp(email: String!, password: String!, name: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createChatRoom(name: String!, description: String): ChatRoom!
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
