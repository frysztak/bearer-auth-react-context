import React, {
  createContext,
  MutableRefObject,
  PropsWithChildren,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { useLocalstorageState } from 'rooks';
import { Mutex } from 'async-mutex';

export interface Tokens {
  bearer: string;
  refresh: string;
}

export interface BearerAuthContextData<FetcherConfig> {
  /**
   * Generic configuration to be consumed by fetcher.
   */
  fetcherConfig: FetcherConfig;

  /**
   * Pair of tokens: bearer token and refresh token.
   */
  tokens: Tokens | null;
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
}

const BearerAuthContext = createContext<BearerAuthContextData<any> | undefined>(
  undefined
);

export type RefreshHandler = (oldTokens: Tokens | null) => Promise<Tokens>;

type BearerAuthContextProviderProps<FetcherConfig extends unknown> = Pick<
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
  refreshHandler: RefreshHandler;
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
    updateTokens(null);
  }, [updateTokens]);

  const triggerRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const newTokens: Tokens = await mutex.runExclusive(() =>
        refreshHandler(tokens)
      );
      setIsRefreshing(false);
      updateTokens(newTokens);

      return newTokens;
    } catch (e) {
      setIsRefreshing(false);
      updateTokens(null);
      return null;
    }
  }, [mutex, refreshHandler, setIsRefreshing, tokens, updateTokens]);

  return (
    <BearerAuthContext.Provider
      value={{
        fetcherConfig,
        tokens,
        clearTokens,
        setTokens,
        hasTokenExpired,
        isRefreshing: isRefreshingRef,
        triggerRefresh,
        tokenAwaiter,
      }}
    >
      {children}
    </BearerAuthContext.Provider>
  );
}

export const useBearerAuthContext = <FetcherConfig extends unknown>() => {
  const context = useContext<BearerAuthContextData<FetcherConfig> | undefined>(
    BearerAuthContext
  );
  if (context === undefined) {
    throw new Error(`useApiContext must be within BearerAuthContextProvider.`);
  }
  return context;
};

type Fetcher<FetcherConfig, Data, Args> = (
  config: FetcherConfig,
  tokens: Tokens | null
) => (args: Args) => Promise<Data>;

const bearerAuthWrapper =
  <FetcherConfig extends unknown>(
    bearerAuthContext: BearerAuthContextData<FetcherConfig>
  ) =>
  <Data, Args>(
    fetcher: Fetcher<FetcherConfig, Data, Args>,
    args: Args
  ): Promise<Data> => {
    const {
      isRefreshing,
      triggerRefresh,
      tokenAwaiter,
      hasTokenExpired,
      fetcherConfig,
      tokens,
    } = bearerAuthContext;

    return new Promise(async (resolve, reject) => {
      try {
        const result = await fetcher(fetcherConfig, tokens)(args);
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
            const result = await fetcher(fetcherConfig, newTokens)(args);
            return resolve(result);
          } catch (e2) {
            return reject(e2);
          }
        }

        return reject(e);
      }
    });
  };

export function useBearerAuthWrapper<FetchConfig>() {
  const authContext = useBearerAuthContext<FetchConfig>();
  return bearerAuthWrapper(authContext);
}
