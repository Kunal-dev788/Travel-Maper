import { createContext, useContext, useReducer, ReactNode } from "react";

type User = {
  name: string;
  email: string;
  password: string;
  avatar: string;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
};

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

type Action =
  | { type: "login"; payload: User }
  | { type: "logout" };

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case "login":
      return { ...state, user: action.payload, isAuthenticated: true };
    case "logout":
      return { ...state, user: null, isAuthenticated: false };
    default:
      throw new Error("Unknown action");
  }
}

const FAKE_USER: User = {
  name: "Kunal",
  email: "kunalrathore@example.com",
  password: "qwerty",
  avatar: "https://avatars.githubusercontent.com/u/182477771?v=4",
};

function AuthProvider({ children }: { children: ReactNode }) {
  const [{ user, isAuthenticated }, dispatch] = useReducer(
    reducer,
    initialState
  );

  function login(email: string, password: string) {
    if (email === FAKE_USER.email && password === FAKE_USER.password)
      dispatch({ type: "login", payload: FAKE_USER });
  }

  function logout() {
    dispatch({ type: "logout" });
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("AuthContext was used outside AuthProvider");
  return context;
}

export { AuthProvider, useAuth };
