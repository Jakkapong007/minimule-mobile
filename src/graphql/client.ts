import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'minimule_jwt';

export const saveToken = (token: string) => AsyncStorage.setItem(TOKEN_KEY, token);
export const getToken = () => AsyncStorage.getItem(TOKEN_KEY);
export const removeToken = () => AsyncStorage.removeItem(TOKEN_KEY);

const httpLink = createHttpLink({
  // Update this to your backend URL (local dev or deployed)
  uri: 'http://localhost:8080/graphql',
});

const authLink = setContext(async (_, { headers }) => {
  const token = await getToken();
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          feed: {
            keyArgs: false,
            merge(existing = [], incoming: unknown[]) {
              return [...existing, ...incoming];
            },
          },
          products: {
            keyArgs: false,
            merge(existing = [], incoming: unknown[]) {
              return [...existing, ...incoming];
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
});
