import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

// HTTP link for queries and mutations
const httpLink = createHttpLink({
  uri: 'http://localhost:4001/graphql',
});

// WebSocket link for subscriptions (graphql-ws protocol)
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4001/graphql',
    connectionParams: () => {
      const token = localStorage.getItem('token');
      return {
        authorization: token ? `Bearer ${token}` : null,
      };
    },
    shouldRetry: () => true,
  })
);

// Split links based on operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

// WebSocket subscriptions are now enabled for real-time messaging!

// Auth link to add JWT token to requests
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

// Create Apollo Client
const client = new ApolloClient({
  link: authLink.concat(splitLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          messages: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
      ChatRoom: {
        fields: {
          messages: {
            merge(existing = [], incoming) {
              // Merge new messages with existing ones, avoiding duplicates
              const existingIds = new Set(existing.map(msg => msg.id));
              const newMessages = incoming.filter(msg => !existingIds.has(msg.id));
              return [...existing, ...newMessages];
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export default client;
