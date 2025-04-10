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
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setMessage('');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setMessageType('error');
        setMessage(error.message);
        return;
      }
      
      if (!data.user) {
        throw new Error('No se pudo iniciar sesión');
      }
      
      // Verificar si el perfil está completo
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_complete')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) {
        console.error('Error al verificar el perfil:', profileError);
        // Si hay error al verificar el perfil, redirigir a la página principal
        router.push('/');
        return;
      }
      
      // Redirigir según el estado del perfil
      if (profileData && !profileData.is_complete) {
        router.push('/profile');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Iniciar Sesión | JobMatch</title>
        <meta name="description" content="Inicia sesión en JobMatch" />
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
            <div className={`message ${messageType}`}>
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
