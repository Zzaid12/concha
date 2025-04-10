import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Verificar si el perfil está completo
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_complete')
          .eq('id', user.id)
          .single();

        if (profile?.is_complete) {
          router.push('/jobs');
        } else {
          router.push('/profile');
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage('Error al iniciar sesión. Por favor, verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Iniciar Sesión | Proyecto Marketing</title>
        <meta name="description" content="Inicia sesión en Proyecto Marketing" />
      </Head>
      
      <div className="auth-page">
        <div className="gradient-bg" style={{ pointerEvents: 'none' }} />
        <motion.div 
          className="auth-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="auth-title">Iniciar Sesión</h1>
          
          {message && (
            <div className={`message error`}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ position: 'relative', zIndex: 20 }}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ position: 'relative', zIndex: 20 }}
              />
            </div>
            
            <motion.button
              type="submit"
              className="auth-button"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ position: 'relative', zIndex: 20 }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </motion.button>
          </form>
          
          <div className="auth-footer">
            <p>
              ¿No tienes una cuenta?{' '}
              <Link href="/register" className="auth-link">
                Regístrate
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
