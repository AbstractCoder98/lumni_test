import { useEffect, useState } from "react";
import IAppSessionState from "./IAppSessionState";
import appStateConfig from "./appStateConfig";

const defaultSessionState: IAppSessionState = {
  isLogin: false,
  loginTimeout: null,
  userId: null,
  personId: null,
  expiration: null,
  roles: [],
  token: null,
};

export function useSessionState() {
  
  const [sessionState, setSessionState] = useState<IAppSessionState | undefined>(undefined);

  useEffect(() => {
    const rawAuthData = localStorage.getItem(appStateConfig.authDataStorageKey);
    if (!rawAuthData) {
      setSessionState(defaultSessionState);
      return;
    }
    try {
      const parsedAuthData = JSON.parse(rawAuthData);
      setSessionState({ isLogin: true, ...parsedAuthData });
    } catch {
      setSessionState(defaultSessionState);
    }
  }, []);


  const storeSessionState = (sessionState: IAppSessionState) => {
    if(sessionState.token) {
      localStorage.setItem(appStateConfig.tokenStorageKey, sessionState.token);
    } else {
      localStorage.removeItem(appStateConfig.tokenStorageKey);
    }
    localStorage.setItem(appStateConfig.authDataStorageKey, JSON.stringify(sessionState));
    setSessionState(sessionState);
  };

  const clearStoredSessionState = () => {
    localStorage.removeItem(appStateConfig.tokenStorageKey);
    localStorage.removeItem(appStateConfig.authDataStorageKey);
    setSessionState(undefined);
  };

  return {
    sessionState: sessionState,
    loadingSessionState: sessionState === undefined,
    storeSessionState,
    clearStoredSessionState,
  };
}
