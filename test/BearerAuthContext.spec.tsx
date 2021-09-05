import React, { useEffect, useMemo, useState } from 'react';
import { act, renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import { useTimeout } from 'rooks';

import {
  BearerAuthContextProvider,
  RefreshHandler,
  Tokens,
  useBearerAuthContext,
  useBearerAuthWrapper,
} from '../src';

type FetchConfig = {};

function promiseDelay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const hasTokenExpired = (error: any) =>
  'statusCode' in error ? error.statusCode === 401 : false;

const fetcherConfig = {};

const oldTokens: Tokens = {
  bearer: 'oldBearerToken',
  refresh: 'oldRefreshToken',
};

const newTokens: Tokens = {
  bearer: 'newBearerToken',
  refresh: 'newRefreshToken',
};

describe('BearerAuthContext', () => {
  describe('bearerAuthWrapper', () => {
    const refreshHandler: RefreshHandler = jest.fn(() =>
      Promise.resolve(newTokens)
    );
    const wrapper: React.FC = ({ children }) => (
      <BearerAuthContextProvider
        fetcherConfig={fetcherConfig}
        refreshHandler={refreshHandler}
        hasTokenExpired={hasTokenExpired}
      >
        {children}
      </BearerAuthContextProvider>
    );

    it('immediately returns value if request succeeds', async () => {
      const fetch = jest
        .fn<Promise<string>, []>()
        .mockResolvedValueOnce('test data');
      const fetchData = (config: FetchConfig) => () => fetch();

      const useRefreshWrapper = () => {
        return useBearerAuthWrapper(fetchData)(void 0);
      };

      const { result } = renderHook(() => useRefreshWrapper(), { wrapper });
      await expect(result.current).resolves.toBe('test data');
      expect(refreshHandler).not.toBeCalled();
      expect(fetch).toBeCalledTimes(1);
    });

    it('refreshes token after Promise rejection', async () => {
      const fetch = jest
        .fn<Promise<string>, []>()
        .mockRejectedValueOnce({ statusCode: 401 })
        .mockResolvedValueOnce('hooray');

      const fetchData = (config: FetchConfig) => () => fetch();
      const useRefreshWrapper = () => {
        const queryFn = useBearerAuthWrapper(fetchData);
        // eslint-disable-next-line
        return useMemo(() => queryFn(void 0), []);
      };

      await act(async () => {
        const { result } = renderHook(() => useRefreshWrapper(), { wrapper });
        await expect(result.current).resolves.toBe('hooray');
        expect(refreshHandler).toBeCalled();
        expect(fetch).toBeCalledTimes(2);
      });
    });
  });

  describe('useSampleQuery', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('immediately returns value if request succeeds', async () => {
      // Arrange
      const refreshHandler: RefreshHandler = jest.fn(() =>
        promiseDelay(50).then(() => Promise.resolve(newTokens))
      );

      const wrapper: React.FC = ({ children }) => {
        const queryClient = new QueryClient();
        return (
          <QueryClientProvider client={queryClient}>
            <BearerAuthContextProvider
              fetcherConfig={fetcherConfig}
              refreshHandler={refreshHandler}
              hasTokenExpired={hasTokenExpired}
            >
              {children}
            </BearerAuthContextProvider>
          </QueryClientProvider>
        );
      };
      const fetch = jest.fn<Promise<string>, []>().mockResolvedValue('hooray');
      const fetchData = (config: FetchConfig) => () => fetch();

      const useSampleQuery = () => {
        const queryFn = useBearerAuthWrapper(fetchData);
        return useQuery('sampleQuery', queryFn);
      };

      // Act
      const { result, waitForNextUpdate } = renderHook(() => useSampleQuery(), {
        wrapper,
      });

      // Assert
      await waitForNextUpdate();
      expect(result.current.data).toBe('hooray');
      expect(result.current.isSuccess).toBe(true);
      expect(refreshHandler).not.toBeCalled();
      expect(fetch).toBeCalledTimes(1);
    });

    it('refreshes token after Promise rejection', async () => {
      // Arrange
      const refreshHandler: RefreshHandler = jest.fn(() =>
        promiseDelay(50).then(() => Promise.resolve(newTokens))
      );

      const wrapper: React.FC = ({ children }) => {
        const queryClient = new QueryClient();
        return (
          <QueryClientProvider client={queryClient}>
            <BearerAuthContextProvider
              fetcherConfig={fetcherConfig}
              refreshHandler={refreshHandler}
              hasTokenExpired={hasTokenExpired}
            >
              {children}
            </BearerAuthContextProvider>
          </QueryClientProvider>
        );
      };
      const fetch = jest
        .fn<Promise<string>, []>()
        .mockRejectedValueOnce({ statusCode: 401 })
        .mockResolvedValueOnce('hooray');
      const fetchData = (config: FetchConfig) => () => fetch();

      const useSampleQuery = () => {
        const queryFn = useBearerAuthWrapper(fetchData);
        return useQuery('sampleQuery', queryFn);
      };

      // Act
      const { result, waitForNextUpdate } = renderHook(() => useSampleQuery(), {
        wrapper,
      });

      // Assert
      await waitForNextUpdate();
      expect(result.current.data).toBe('hooray');
      expect(result.current.isSuccess).toBe(true);
      expect(refreshHandler).toBeCalled();
      expect(fetch).toBeCalledTimes(2);
    });

    /*
     *
     * Scenario 1:
     * legend:
     * - - request in flight
     * x - start of request
     * \ - server response, token needs to be refreshed
     * / - successful server response
     *
     * isRefreshing: |000000111111110000
     * request1:     |x-----\------/
     * request2:     |               x----/
     *
     * */
    it('works for Scenario #1', async () => {
      // Arrange
      const refreshHandler: RefreshHandler = jest.fn(() =>
        promiseDelay(50).then(() => Promise.resolve(newTokens))
      );

      const wrapper: React.FC = ({ children }) => {
        const queryClient = new QueryClient();
        return (
          <QueryClientProvider client={queryClient}>
            <BearerAuthContextProvider
              fetcherConfig={fetcherConfig}
              initialAuthTokens={oldTokens}
              refreshHandler={refreshHandler}
              hasTokenExpired={hasTokenExpired}
            >
              {children}
            </BearerAuthContextProvider>
          </QueryClientProvider>
        );
      };

      const fetch1 = jest
        .fn<Promise<string>, []>()
        .mockRejectedValueOnce({ statusCode: 401 })
        .mockResolvedValueOnce('hooray');

      const fetchData1 = jest.fn(
        (config: FetchConfig) => () => promiseDelay(100).then(fetch1)
      );

      const fetch2 = jest
        .fn<Promise<string>, []>()
        .mockResolvedValueOnce('hooray2');

      const fetchData2 = jest.fn(
        (config: FetchConfig) => () => promiseDelay(50).then(fetch2)
      );

      const useSampleQuery1 = () => {
        const queryFn = useBearerAuthWrapper(fetchData1);
        return useQuery('sampleQuery1', () => queryFn(['fetch1']));
      };

      const useSampleQuery2 = (enabled: boolean) => {
        const queryFn = useBearerAuthWrapper(fetchData2);
        return useQuery('sampleQuery2', () => queryFn(['fetch2']), {
          enabled,
        });
      };

      // Act
      const { result, waitFor } = renderHook(
        () => {
          const [enabled, setEnabled] = useState<boolean>(false);
          const { start } = useTimeout(() => {
            setEnabled(true);
          }, 200);
          useEffect(() => {
            start();
          }, [start]);
          return [
            useSampleQuery1(),
            useSampleQuery2(enabled),
            useBearerAuthContext(),
          ] as const;
        },
        {
          wrapper,
        }
      );

      // Assert
      await waitFor(() => result.current[0].isLoading);
      await waitFor(() => result.current[2].isRefreshing.current);
      await waitFor(() => !result.current[2].isRefreshing.current);
      await waitFor(() => !result.current[0].isLoading);
      await waitFor(() => !result.current[1].isLoading);
      expect(result.current[0].data).toBe('hooray');
      expect(result.current[1].data).toBe('hooray2');
      expect(result.current[0].isSuccess).toBe(true);
      expect(result.current[1].isSuccess).toBe(true);

      expect(refreshHandler).toBeCalledTimes(1);

      expect(fetch1).toBeCalledTimes(2);
      expect(fetchData1).toBeCalledWith(fetcherConfig, oldTokens);
      expect(fetchData1).toBeCalledWith(fetcherConfig, newTokens);

      expect(fetch2).toBeCalledTimes(1);
      expect(fetchData2).toBeCalledWith(fetcherConfig, newTokens);
    });

    /*
     *
     * Scenario 2:
     * legend:
     * - - request in flight
     * x - start of request
     * \ - server response, token needs to be refreshed
     * / - successful server response
     * . - request stalled
     *
     * isRefreshing: |000000111111110000
     * request1:     |x-----\------/------
     * request2:     |x-----\....../
     *
     * */
    it('works for Scenario #2', async () => {
      // Arrange
      const refreshHandler: RefreshHandler = jest.fn(() =>
        promiseDelay(50).then(() => Promise.resolve(newTokens))
      );

      const wrapper: React.FC = ({ children }) => {
        const queryClient = new QueryClient();
        return (
          <QueryClientProvider client={queryClient}>
            <BearerAuthContextProvider
              fetcherConfig={fetcherConfig}
              initialAuthTokens={oldTokens}
              refreshHandler={refreshHandler}
              hasTokenExpired={hasTokenExpired}
            >
              {children}
            </BearerAuthContextProvider>
          </QueryClientProvider>
        );
      };

      const fetch1 = jest
        .fn<Promise<string>, []>()
        .mockRejectedValueOnce({ statusCode: 401 })
        .mockResolvedValueOnce('hooray');

      const fetchData1 = jest.fn(
        (config: FetchConfig) => () => promiseDelay(100).then(fetch1)
      );

      const fetch2 = jest
        .fn<Promise<string>, []>()
        .mockRejectedValueOnce({ statusCode: 401 })
        .mockResolvedValueOnce('hooray2');
      const fetchData2 = jest.fn(
        (config: FetchConfig) => () => promiseDelay(100).then(fetch2)
      );

      const useSampleQuery1 = () => {
        const queryFn = useBearerAuthWrapper(fetchData1);
        return useQuery('sampleQuery1', () => queryFn(['fetch1']));
      };

      const useSampleQuery2 = () => {
        const queryFn = useBearerAuthWrapper(fetchData2);
        return useQuery('sampleQuery2', () => queryFn(['fetch2']));
      };

      // Act

      const { result, waitFor } = renderHook(
        () =>
          [
            useSampleQuery1(),
            useSampleQuery2(),
            useBearerAuthContext(),
          ] as const,
        {
          wrapper,
        }
      );

      // Assert
      await waitFor(() => result.current[0].isLoading);
      await waitFor(() => result.current[2].isRefreshing.current);
      await waitFor(() => !result.current[2].isRefreshing.current);
      await waitFor(() => !result.current[0].isLoading);
      await waitFor(() => !result.current[1].isLoading);
      expect(result.current[0].data).toBe('hooray');
      expect(result.current[1].data).toBe('hooray2');
      expect(result.current[0].isSuccess).toBe(true);
      expect(result.current[1].isSuccess).toBe(true);

      expect(refreshHandler).toBeCalledTimes(1);

      expect(fetch1).toBeCalledTimes(2);
      expect(fetchData1).toBeCalledWith(fetcherConfig, oldTokens);
      expect(fetchData1).toBeCalledWith(fetcherConfig, newTokens);

      expect(fetch2).toBeCalledTimes(2);
      expect(fetchData1).toBeCalledWith(fetcherConfig, oldTokens);
      expect(fetchData2).toBeCalledWith(fetcherConfig, newTokens);
    });

    /*
     *
     * Scenario 3:
     * legend:
     * - - request in flight
     * x - start of request
     * \ - server response, token needs to be refreshed
     * / - successful server response
     * . - request stalled
     * , - request failed
     *
     * isRefreshing: |000000111111110000
     * request1:     |x-----\------,
     * request2:     |x-----\......,
     *
     * */
    it('works for Scenario #3', async () => {
      // Arrange
      const refreshHandler: RefreshHandler = jest.fn(() =>
        promiseDelay(50).then(() =>
          Promise.reject({
            statusCode: 501,
          })
        )
      );

      const wrapper: React.FC = ({ children }) => {
        const queryClient = new QueryClient();
        return (
          <QueryClientProvider client={queryClient}>
            <BearerAuthContextProvider
              fetcherConfig={fetcherConfig}
              initialAuthTokens={oldTokens}
              refreshHandler={refreshHandler}
              hasTokenExpired={hasTokenExpired}
            >
              {children}
            </BearerAuthContextProvider>
          </QueryClientProvider>
        );
      };

      const fetch1 = jest
        .fn<Promise<string>, []>()
        .mockRejectedValue({ statusCode: 401 });
      const fetchData1 = jest.fn(
        (config: FetchConfig) => () => promiseDelay(100).then(fetch1)
      );

      const fetch2 = jest
        .fn<Promise<string>, []>()
        .mockRejectedValue({ statusCode: 401 });
      const fetchData2 = jest.fn(
        (config: FetchConfig) => () => promiseDelay(100).then(fetch2)
      );

      const useSampleQuery1 = () => {
        const queryFn = useBearerAuthWrapper(fetchData1);
        return useQuery('sampleQuery1', () => queryFn(['fetch1']), {
          retry: false,
        });
      };

      const useSampleQuery2 = () => {
        const queryFn = useBearerAuthWrapper(fetchData2);
        return useQuery('sampleQuery2', () => queryFn(['fetch2']), {
          retry: false,
        });
      };

      // Act

      const { result, waitFor } = renderHook(
        () => {
          return [
            useSampleQuery1(),
            useSampleQuery2(),
            useBearerAuthContext(),
          ] as const;
        },
        {
          wrapper,
        }
      );

      // Assert
      await waitFor(() => result.current[0].isLoading);
      await waitFor(() => result.current[2].isRefreshing.current);
      await waitFor(() => !result.current[2].isRefreshing.current);
      await waitFor(() => !result.current[0].isLoading);
      await waitFor(() => !result.current[1].isLoading);

      expect(result.current[0].isError).toBe(true);
      expect(result.current[0].error).toEqual({ statusCode: 401 });
      expect(result.current[1].isError).toBe(true);
      expect(result.current[1].error).toEqual({ statusCode: 401 });
      expect(refreshHandler).toBeCalledTimes(1);

      expect(fetch1).toBeCalledTimes(1);
      expect(fetchData1).toBeCalledWith(fetcherConfig, oldTokens);

      expect(fetch2).toBeCalledTimes(1);
      expect(fetchData2).toBeCalledWith(fetcherConfig, oldTokens);
    });

    /*
     *
     * Scenario 4:
     * legend:
     * - - request in flight
     * x - start of request
     * \ - server response, token needs to be refreshed
     * / - successful server response
     * . - request stalled
     * , - request failed
     *
     * isRefreshing: |000000111111110000
     * request1:     |x-----,
     * request2:     |x-----\------/,
     *
     * */
    it('works for Scenario #4', async () => {
      // Arrange
      const refreshHandler: RefreshHandler = jest.fn(() =>
        Promise.resolve(newTokens)
      );

      const wrapper: React.FC = ({ children }) => {
        const queryClient = new QueryClient();
        return (
          <QueryClientProvider client={queryClient}>
            <BearerAuthContextProvider
              fetcherConfig={fetcherConfig}
              initialAuthTokens={oldTokens}
              refreshHandler={refreshHandler}
              hasTokenExpired={hasTokenExpired}
            >
              {children}
            </BearerAuthContextProvider>
          </QueryClientProvider>
        );
      };

      const fetch1 = jest
        .fn<Promise<string>, []>()
        .mockRejectedValue({ statusCode: 500 });
      const fetchData1 = jest.fn(
        (config: FetchConfig) => () => promiseDelay(100).then(fetch1)
      );

      const fetch2 = jest
        .fn<Promise<string>, []>()
        .mockRejectedValueOnce({ statusCode: 401 })
        .mockResolvedValueOnce('hooray2');
      const fetchData2 = jest.fn(
        (config: FetchConfig) => () => promiseDelay(100).then(fetch2)
      );

      const useSampleQuery1 = () => {
        const queryFn = useBearerAuthWrapper(fetchData1);
        return useQuery('sampleQuery1', () => queryFn(['fetch1']), {
          retry: false,
        });
      };

      const useSampleQuery2 = () => {
        const queryFn = useBearerAuthWrapper(fetchData2);
        return useQuery('sampleQuery2', () => queryFn(['fetch2']), {
          retry: false,
        });
      };

      // Act

      const { result, waitFor } = renderHook(
        () =>
          [
            useSampleQuery1(),
            useSampleQuery2(),
            useBearerAuthContext(),
          ] as const,
        {
          wrapper,
        }
      );

      // Assert
      await waitFor(() => result.current[1].isLoading);
      await waitFor(() => !result.current[0].isLoading);
      await waitFor(() => !result.current[1].isLoading);

      expect(result.current[0].isError).toBe(true);
      expect(result.current[0].error).toEqual({ statusCode: 500 });
      expect(result.current[1].isError).toBe(false);
      expect(result.current[1].isSuccess).toBe(true);
      expect(result.current[1].data).toEqual('hooray2');
      expect(refreshHandler).toBeCalledTimes(1);

      expect(fetch1).toBeCalledTimes(1);
      expect(fetchData1).toBeCalledWith(fetcherConfig, oldTokens);

      expect(fetch2).toBeCalledTimes(2);
      expect(fetchData2).toBeCalledWith(fetcherConfig, oldTokens);
      expect(fetchData2).toBeCalledWith(fetcherConfig, newTokens);
    });
  });
});
