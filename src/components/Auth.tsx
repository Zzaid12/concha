import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (type: 'login' | 'signup') => {
    const { error } = 
      type === 'login' 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (error) alert(error.message);
    else alert(type === 'login' ? '¡Bienvenido!' : 'Confirma tu correo.');
  };

  return (
    <div className="auth-container">
      <h2>Acceso para Creadores</h2>
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={() => handleLogin('login')}>Iniciar Sesión</button>
      <button onClick={() => handleLogin('signup')}>Registrarse</button>
    </div>
  );
}