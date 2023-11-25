import UserRole from "@domain/models/UserRole";
import SplitPageLayout from "@view/common/SplitPageLayout/SplitPageLayout";
import { useCallback, useEffect, useMemo, useState } from "react";
import NotificationModal from "../NotificationModal/NotificationModal";
import { useNotificationModal } from "../NotificationModal/useNotificationModal";
import LoginPageDecorationSection from "./LoginPageDecorationSection";
import styles from "./LoginPage.module.css";
import { useRouter } from "next/router";
import useAppState from "../AppState/useAppState";
import LoginManager from "../LoginManager";
import AppHeaderLayout from "../AppHeaderLayout";
import IAppSessionState from "../AppState/IAppSessionState";

const LoginPage = () => {

  const router = useRouter();
  const { sessionState, storeSessionState, clearStoredSessionState } = useAppState();
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const { openNotificationModal, notificationModalProps } = useNotificationModal();

  const goToHome = () => {
    if (!sessionState?.isLogin) return;

    if (sessionState.roles.includes(UserRole.Staff)) {
      router.push("/admin");
    } else if (sessionState.roles.includes(UserRole.Student)) {
      router.push("/students");
    } else {
      openNotificationModal({
        variant: "error",
        title: "Error",
        description: "Lo sentimos no se pudo reconocer su tipo de usuario. Intenta iniciar sesión nuevamente.",
        actionLabel: "Aceptar"
      });
    }
  };

  const resetLoginTimeout = () => {
    clearStoredSessionState()
    setIsLocked(false);
    setLoginAttempts(0);
  }

  const setNewLoginTimeout = (currentSessionState: IAppSessionState) => {
    const currentDate = new Date();
    const minutesToAwait = 5
    currentDate.setMinutes(currentDate.getMinutes() + minutesToAwait)
    currentSessionState.loginTimeout = currentDate
    storeSessionState(currentSessionState)
    setTimeout(() => {
      resetLoginTimeout()
    }, minutesToAwait * 60 * 1000);
  }

  const updateSessionState = useCallback((loginAttemptsFailed: boolean, currentSessionState: IAppSessionState) => {
    if (currentSessionState) {
      const timeoutDate = currentSessionState.loginTimeout ? new Date(currentSessionState.loginTimeout) : null;
      const currentDate = new Date();
      if (loginAttemptsFailed) {
        setNewLoginTimeout(currentSessionState)
        return
      }
      const shouldReset = timeoutDate != null && currentDate > timeoutDate
      shouldReset && resetLoginTimeout()
      setIsLocked(timeoutDate != null && currentDate < timeoutDate)
    }
    return
  }, [])

  useEffect(() => {
    if (isLocked && sessionState?.loginTimeout) {
      const timeoutDate = new Date(sessionState.loginTimeout)
      const currentDate = new Date();

      const timeDifference = timeoutDate.getTime() - currentDate.getTime();
      const seconds = Math.floor(timeDifference / 1000);
      const msToWait = seconds * 1000

      openNotificationModal({
        variant: "warning",
        title: "Login deshabilitado",
        description: `El login sera habilitado tras pasar ${seconds} segundos`,
      });

      setTimeout(() => {
        resetLoginTimeout()
      }, msToWait);
    }
  }, [isLocked])

  useEffect(() => {
    if (sessionState) updateSessionState(false, sessionState);
    if (!sessionState?.isLogin) return;
    goToHome();
  }, [sessionState]);

  useEffect(() => {
    if (loginAttempts > 3 && sessionState) {
      setIsLocked(true)
      updateSessionState(true, sessionState)
    }
  }, [loginAttempts]);

  const onLoginFail = () => {
    setLoginAttempts(loginAttempts + 1)
    const remainingAttempts = 4 - (loginAttempts + 1)
    const remainingAttemptsMesage = remainingAttempts != 0 ? ` Número de reintentos restantes: ${4 - (loginAttempts + 1)}` : ""
    openNotificationModal({
      variant: "error",
      title: "Credenciales invalidas",
      description: `El usuario no existe o las credenciales del usuario son invalidas.${remainingAttemptsMesage}`,
    });
  };

  const onError = () => {
    setLoginAttempts(loginAttempts + 1)
    const remainingAttempts = 4 - (loginAttempts + 1)
    const remainingAttemptsMesage = remainingAttempts != 0 ? ` Número de reintentos restantes: ${4 - (loginAttempts + 1)}` : ""
    openNotificationModal({
      variant: "error",
      title: "Error inesperado",
      description: `Lo sentimos ha currido un error inesperado en nuestros servicios.${remainingAttemptsMesage}`,
    });
  };

  return (
    <AppHeaderLayout>
      <SplitPageLayout>
        <LoginPageDecorationSection />
        <div className={styles.formSection}>
          <LoginManager 
            isLocked={isLocked}
            onLoginFail={onLoginFail} 
            onError={onError} 
          />
        </div>
      </SplitPageLayout>
      <NotificationModal {...notificationModalProps} />
    </AppHeaderLayout>
  );
}

export default LoginPage;
