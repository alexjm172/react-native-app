import { useMemo, useState, useCallback } from 'react';
import { AuthRepositoryImpl } from '../../../../../data/repositories/AuthRepositoryImpl';
import { LoginWithEmail } from '../../../../../domain/usecases/auth/LoginWithEmailUseCase';
import { RegisterWithEmail } from '../../../../../domain/usecases/auth/RegisterWithEmailUseCase';
import { mapFirebaseAuthError } from '../../../../../core/errors/firebaseAuthError.mapper';
type Mode = 'login' | 'register';

export type AuthVMState = {
  mode: Mode;
  email: string;
  nombre: string;
  password: string;
  loading: boolean;
  error: string | null;
};

export type AuthVMActions = {
  setEmail: (v: string) => void;
  setNombre: (v: string) => void;
  setPassword: (v: string) => void;
  toggleMode: () => void;
  submit: () => Promise<void>;
};

export function useAuthVM(): AuthVMState & AuthVMActions {
  // DI mínima: el VM crea los casos de uso a partir del repo.
  const repo = useMemo(() => new AuthRepositoryImpl(), []);
  const loginUC = useMemo(() => new LoginWithEmail(repo), [repo]);
  const registerUC = useMemo(() => new RegisterWithEmail(repo), [repo]);

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setErr] = useState<string | null>(null);

  const validate = useCallback(() => {
    if (!email.trim()) return 'Introduce un email.';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Email no válido.';
    if (!password) return 'Introduce la contraseña.';
    if (mode === 'register' && !nombre.trim()) return 'Introduce tu nombre.';
    return null;
  }, [email, password, nombre, mode]);

  const submit = useCallback(async () => {
    setErr(null);
    const v = validate();
    if (v) { setErr(v); return; }

    setLoading(true);
    try {
      if (mode === 'login') {
        await loginUC.exec(email.trim(), password);
      } else {
        await registerUC.exec(nombre.trim(), email.trim(), password);
      }
      // onAuthStateChanged (en AuthProvider) cambiará a la app autenticada.
    } catch (e: any) {
      setErr(mapFirebaseAuthError(e));
    } finally {
      setLoading(false);
    }
  }, [mode, email, password, nombre, loginUC, registerUC, validate]);

  const toggleMode = useCallback(() => {
    setMode(m => (m === 'login' ? 'register' : 'login'));
    setErr(null);
  }, []);

  return {
    // state
    mode, email, nombre, password, loading, error,
    // actions
    setEmail, setNombre, setPassword, toggleMode, submit,
  };
}