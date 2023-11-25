import { FormEvent, useState } from "react";
import styles from "./LoginManager.module.css";
import { loginWithEmailAndPassword } from "../Api/LoginApi";
import useAppState from "../AppState/useAppState";
import ButtonWithLoading from "../ButtonWithLoading";
import Input from "../Fields/Input";


export interface ILoginManagerProps {
  onLoginSuccess?: () => void;
  onLoginFail?: () => void;
  onError?: () => void;
  isLocked: boolean;
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
    evt.preventDefault();
    callLoginApi(inputEmail!, inputPassword!);
  };

  return (
    <section className={styles.root}>
      <h1>Inicia sesión</h1>
      <form className={styles.form} onSubmit={onSubmit}>
        <p>Inicia sesión con tu usuario y contraseña</p>
        <label>Correo electrónico</label>
        <Input required={true} variant="filled" type="email" disabled={props.isLocked} onChange={e => { setInputEmail(e.target.value) }} />
        <label>Contraseña</label>
        <Input required variant="filled" type="password" disabled={props.isLocked} onChange={e => { setInputPassword(e.target.value) }} />
        {props.isLocked && (
            <p className={styles.validation_error}>Login deshabilitado... intente mas tarde</p>
          )
        }
        <ButtonWithLoading
          variant="contained"
          disabled={props.isLocked}
          color="primary"
          type="submit"
          loading={loading === true}
        >
          Iniciar Sesión
        </ButtonWithLoading>
      </form>
    </section>
  )
};

export default LoginManager;
