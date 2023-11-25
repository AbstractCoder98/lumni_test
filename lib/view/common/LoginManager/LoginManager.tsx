import { FormEvent, useState } from "react";
import styles from "./LoginManager.module.css";
import { loginWithEmailAndPassword } from "../Api/LoginApi";
import useAppState from "../AppState/useAppState";


export interface ILoginManagerProps {
  onLoginSuccess?: () => void;
  onLoginFail?: () => void;
  onError?: () => void;
}

const LoginManager = (props: ILoginManagerProps) => {

  const { storeSessionState } = useAppState();
  const [loading, setLoading] = useState(false);
  const [inputEmail, setInputEmail] = useState<string | undefined>(undefined);
  const [inputPassword, setInputPassword] = useState<string | undefined>(undefined);


  const callLoginApi = async (email: string, password: string) => {
    setLoading(true);
    const response = await loginWithEmailAndPassword({
      email,
      password
    });
    setLoading(false);

    if (response.status === 401) {
      props.onLoginFail && props.onLoginFail();

    } else if (!response.isSuccess) {
      props.onError && props.onError();
    } else {
      storeSessionState({ isLogin: true, loginTimeout: null, ...response.body });
      props.onLoginSuccess && props.onLoginSuccess();
    }
  }

  const onSubmit = (evt: FormEvent) => {
    // TODO: implement
    evt.preventDefault();
    callLoginApi("admin.user@lumni.net", "12345678");
  };

  return (
    <section className={styles.root}>
      <h1>Inicia sesión</h1>
      <form onSubmit={onSubmit}>
        {/* TODO: Implement inputs */}
        <button type="submit">Login</button>
      </form>
    </section>
  )
};

export default LoginManager;
