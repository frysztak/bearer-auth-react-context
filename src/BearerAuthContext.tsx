import React, {
  createContext,
  MutableRefObject,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useLocalstorageState } from 'rooks';
import { Mutex } from 'async-mutex';

export interface Tokens {
  /**
   * Bearer token.
   */
  bearerToken?: string;

  /**
   * Refresh token. Optional, since your API might store refresh token in cookies.
   */
  refreshToken?: string;
}

export interface BearerAuthContextData<FetcherConfig extends Tokens> {
  /**
   * Generic configuration to be consumed by fetcher.
   * Includes pair of tokens: bearer token and refresh token.
   */
  fetcherConfig: FetcherConfig;

  /**
   * Manually sets tokens.
   * @param tokens
   */
  setTokens: (tokens: Tokens) => void;

  /**
   * Manually clears tokens.
   */
  clearTokens: () => void;

  /**
   * Runs when request fails. Checks whether request failed because of expired token.
   * @param error - any error returned by API
   */
  hasTokenExpired: (error: any) => boolean;

  /**
   * Boolean flag telling whether token refresh is currently in progress.
   */
  isRefreshing: MutableRefObject<boolean>;

  /**
   * Manually trigger token refresh.
   */
  triggerRefresh: () => Promise<Tokens | null>;

  /**
   * Returns Promise that resolves when token is done refreshing. To be used in conjunction with `triggerRefresh`.
   */
  tokenAwaiter: () => Promise<Tokens | null>;

  /**
   * Set callback to be called when token refresh fails. Re-exported as `useRefreshFailureHandler()` hook.
   */
  setRefreshFailureHandler: (handler: RefreshFailureHandler | null) => void;

  /**
   * Set callback to be called when token refresh succeeds. Re-exported as `useRefreshSuccessHandler()` hook.
   */
  setRefreshSuccessHandler: (handler: RefreshSuccessHandler | null) => void;
}

const BearerAuthContext = createContext<BearerAuthContextData<any> | undefined>(
  undefined
);

export type RefreshHandler<FetcherConfig extends Tokens> = (
  fetcherConfig: FetcherConfig
) => Promise<Tokens>;

export type RefreshSuccessHandler = (tokens: Tokens) => void;
export type RefreshFailureHandler = (error: unknown) => void;

type BearerAuthContextProviderProps<FetcherConfig extends Tokens> = Pick<
  BearerAuthContextData<FetcherConfig>,
  'fetcherConfig' | 'hasTokenExpired'
> & {
  /**
   * Initial pair of refresh and bearer tokens.
   * @default `null`
   */
  initialAuthTokens?: Tokens;

  /**
   * LocalStorage key name for token pair.
   * @default `bearerAuthTokens`
   */
  authTokensLocalStorageKey?: string;

  /**
   * Function that implements token refresh.
   */
  refreshHandler: RefreshHandler<FetcherConfig>;
};

export function BearerAuthContextProvider<FetcherConfig>(
  props: PropsWithChildren<BearerAuthContextProviderProps<FetcherConfig>>
) {
  const {
    children,
    fetcherConfig,
    initialAuthTokens,
    authTokensLocalStorageKey,
    refreshHandler,
    hasTokenExpired,
  } = props;

  const isRefreshingRef = useRef<boolean>(false);
  const resolverRef = useRef<((tokens: Tokens | null) => void) | null>(null);
  const [tokens, setTokens] = useLocalstorageState<Tokens | null>(
    authTokensLocalStorageKey ?? 'bearerAuthTokens',
    initialAuthTokens ?? null
  );
  const refreshFailureHandler = useRef<RefreshFailureHandler | null>(null);
  const refreshSuccessHandler = useRef<RefreshSuccessHandler | null>(null);

  const tokenAwaiter = useCallback(() => {
    return new Promise<Tokens | null>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const setIsRefreshing = useCallback((isRefreshing: boolean) => {
    isRefreshingRef.current = isRefreshing;
  }, []);

  const updateTokens = useCallback(
    (newTokens: Tokens | null) => {
      if (newTokens) {
        setTokens(newTokens);
      }
      resolverRef.current?.(newTokens);
    },
    [setTokens]
  );

  const [mutex] = useState(new Mutex());

  const clearTokens = useCallback(() => {
    setTokens(null);
  }, [setTokens]);

  const triggerRefresh = useCallback(() => {
    setIsRefreshing(true);
    return new Promise<Tokens | null>((resolve) => {
      mutex.runExclusive(() => {
        refreshHandler(fetcherConfig)
          .then((newTokens: Tokens) => {
            setIsRefreshing(false);
            updateTokens(newTokens);
            refreshSuccessHandler.current?.(newTokens);
            resolve(newTokens);
          })
          .catch((e: unknown) => {
            setIsRefreshing(false);
            updateTokens(null);
            refreshFailureHandler.current?.(e);
            resolve(null);
          });
      });
    });
  }, [fetcherConfig, mutex, refreshHandler, setIsRefreshing, updateTokens]);

  const setRefreshFailureHandler = useCallback(
    (handler: RefreshFailureHandler | null) => {
      refreshFailureHandler.current = handler;
    },
    []
  );

  const setRefreshSuccessHandler = useCallback(
    (handler: RefreshSuccessHandler | null) => {
      refreshSuccessHandler.current = handler;
    },
    []
  );

  return (
    <BearerAuthContext.Provider
      value={{
        fetcherConfig: {
          ...fetcherConfig,
          ...tokens,
        },
        clearTokens,
        setTokens,
        hasTokenExpired,
        isRefreshing: isRefreshingRef,
        triggerRefresh,
        tokenAwaiter,
        setRefreshFailureHandler,
        setRefreshSuccessHandler,
      }}
    >
      {children}
    </BearerAuthContext.Provider>
  );
}

export const useBearerAuthContext = <FetcherConfig extends Tokens>() => {
  const context = useContext<BearerAuthContextData<FetcherConfig> | undefined>(
    BearerAuthContext
  );
  if (context === undefined) {
    throw new Error(`useApiContext must be within BearerAuthContextProvider.`);
  }
  return context;
};

type Fetcher<FetcherConfig extends Tokens, Data, Args> = (
  config: FetcherConfig
) => (args: Args) => Promise<Data>;

const bearerAuthWrapper =
  <FetcherConfig extends Tokens>(
    bearerAuthContext: BearerAuthContextData<FetcherConfig>
  ) =>
  <Data, Args>(fetcher: Fetcher<FetcherConfig, Data, Args>) =>
  (args: Args): Promise<Data> => {
    const {
      isRefreshing,
      triggerRefresh,
      tokenAwaiter,
      hasTokenExpired,
      fetcherConfig,
    } = bearerAuthContext;

    return new Promise(async (resolve, reject) => {
      try {
        const result = await fetcher(fetcherConfig)(args);
        return resolve(result);
      } catch (e) {
        const tokenExpired: boolean = hasTokenExpired(e);
        if (!tokenExpired) {
          return reject(e);
        }

        const newTokens: Tokens | null = isRefreshing.current
          ? await tokenAwaiter()
          : await triggerRefresh();

        if (newTokens) {
          try {
            const newConfig = {
              ...fetcherConfig,
              ...newTokens,
            };
            const result = await fetcher(newConfig)(args);
            return resolve(result);
          } catch (e2) {
            return reject(e2);
          }
        }

        return reject(e);
      }
    });
  };

export function useBearerAuthWrapper<FetchConfig, Data, Args>(
  fetcher: Fetcher<FetchConfig, Data, Args>
) {
  const authContext = useBearerAuthContext<FetchConfig>();
  return bearerAuthWrapper(authContext)(fetcher);
}

export function useBearerToken(): string | undefined {
  const authContext = useBearerAuthContext();
  return authContext.fetcherConfig.bearerToken;
}

export function useRefreshToken(): string | undefined {
  const authContext = useBearerAuthContext();
  return authContext.fetcherConfig.refreshToken;
}

export function useRefreshFailureHandler(handler: RefreshFailureHandler) {
  const { setRefreshFailureHandler } = useBearerAuthContext();
  useEffect(() => {
    setRefreshFailureHandler(handler);
    return () => setRefreshFailureHandler(null);
  }, [handler, setRefreshFailureHandler]);
}

export function useRefreshSuccessHandler(handler: RefreshSuccessHandler) {
  const { setRefreshSuccessHandler } = useBearerAuthContext();
  useEffect(() => {
    setRefreshSuccessHandler(handler);
    return () => setRefreshSuccessHandler(null);
  }, [handler, setRefreshSuccessHandler]);
}
