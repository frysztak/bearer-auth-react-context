import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ChakraProvider, Container } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BearerAuthContextProvider } from 'bearer-auth-react-context';
import { FetchConfig } from './api/config';
import { handleTokenRefresh, hasTokenExpired } from './api/helpers';
import { RouterPage } from './pages/RouterPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

const fetcherConfig: FetchConfig = {
  baseUrl: process.env.API_URL || 'ee',
};

const App = () => {
  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <BearerAuthContextProvider
          fetcherConfig={fetcherConfig}
          hasTokenExpired={hasTokenExpired}
          refreshHandler={handleTokenRefresh}
        >
          <Container maxW="container.xl">
            <RouterPage />
          </Container>
        </BearerAuthContextProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
