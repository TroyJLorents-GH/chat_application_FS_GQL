import { gql } from '@apollo/client';

// Queries
export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      name
      createdAt
    }
  }
`;

export const GET_GROUPS = gql`
  query GetGroups {
    groups {
      id
      name
      description
      icon
      roomCount
      createdAt
    }
  }
`;

export const GET_CHAT_ROOMS = gql`
  query GetChatRooms($groupId: ID) {
    chatRooms(groupId: $groupId) {
      id
      name
      description
      createdAt
      messageCount
      lastActivity
      tags
      group {
        id
        name
        icon
      }
      members {
        id
        name
      }
    }
  }
`;

export const SEARCH_ROOMS = gql`
  query SearchRooms($query: String!, $groupId: ID) {
    searchRooms(query: $query, groupId: $groupId) {
      id
      name
      description
      createdAt
      messageCount
      lastActivity
      tags
      group {
        id
        name
        icon
      }
      members {
        id
        name
      }
    }
  }
`;

export const GET_POPULAR_TOPICS = gql`
  query GetPopularTopics($groupId: ID, $limit: Int) {
    getPopularTopics(groupId: $groupId, limit: $limit) {
      keyword
      frequency
      rooms {
        id
        name
        group {
          name
          icon
        }
      }
    }
  }
`;

export const GET_CHAT_ROOM = gql`
  query GetChatRoom($id: ID!) {
    chatRoom(id: $id) {
      id
      name
      description
      createdAt
      members {
        id
        name
        email
      }
      messages {
        id
        text
        createdAt
        author {
          id
          name
        }
      }
    }
  }
`;

export const GET_MESSAGES = gql`
  query GetMessages($roomId: ID!) {
    messages(roomId: $roomId) {
      id
      text
      createdAt
      author {
        id
        name
      }
    }
  }
`;

// Mutations
export const SIGN_UP = gql`
  mutation SignUp($email: String!, $password: String!, $name: String!) {
    signUp(email: $email, password: $password, name: $name) {
      token
      user {
        id
        email
        name
        createdAt
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        name
        createdAt
      }
    }
  }
`;

export const CREATE_CHAT_ROOM = gql`
  mutation CreateChatRoom($name: String!, $description: String, $groupId: ID!, $tags: [String!]) {
    createChatRoom(name: $name, description: $description, groupId: $groupId, tags: $tags) {
      id
      name
      description
      createdAt
      group {
        id
        name
        icon
      }
      tags
    }
  }
`;

export const JOIN_CHAT_ROOM = gql`
  mutation JoinChatRoom($roomId: ID!) {
    joinChatRoom(roomId: $roomId) {
      id
      name
      description
      createdAt
    }
  }
`;

export const LEAVE_CHAT_ROOM = gql`
  mutation LeaveChatRoom($roomId: ID!) {
    leaveChatRoom(roomId: $roomId) {
      id
      name
      description
      createdAt
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($roomId: ID!, $text: String!) {
    sendMessage(roomId: $roomId, text: $text) {
      id
      text
      createdAt
      author {
        id
        name
      }
    }
  }
`;

// Subscriptions
export const MESSAGE_ADDED = gql`
  subscription OnMessageAdded($roomId: ID!) {
    messageAdded(roomId: $roomId) {
      id
      text
      createdAt
      author {
        id
        name
      }
    }
  }
`;

export const USER_JOINED_ROOM = gql`
  subscription OnUserJoinedRoom($roomId: ID!) {
    userJoinedRoom(roomId: $roomId) {
      id
      name
      email
    }
  }
`;

export const USER_LEFT_ROOM = gql`
  subscription OnUserLeftRoom($roomId: ID!) {
    userLeftRoom(roomId: $roomId) {
      id
      name
      email
    }
  }
`;
