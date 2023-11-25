import UserRole from "@domain/models/UserRole";

interface IAppSessionState {
  isLogin: boolean;
  loginTimeout: Date | null;
  userId: string | null;
  personId: string | null;
  expiration: string | null;
  roles: UserRole[];
  token: string | null;
}

export default IAppSessionState;
