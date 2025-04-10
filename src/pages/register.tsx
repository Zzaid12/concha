import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';

const RegisterPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setMessage('');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        setMessageType('error');
        setMessage(error.message);
        return;
      }
      
      if (!data.user) {
        throw new Error('No se pudo crear la cuenta');
      }
      
      // Crear perfil inicial
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            is_complete: false,
            role: 'user'
          }
        ]);
        
      if (profileError) {
        console.error('Error al crear el perfil:', profileError);
        setMessageType('error');
        setMessage('Error al crear el perfil. Por favor, intenta de nuevo.');
        return;
      }
      
      // Redirigir a la página de perfil para completar la información
      router.push('/profile');
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Registro | JobMatch</title>
        <meta name="description" content="Regístrate en JobMatch" />
      </Head>
      
      <div className="auth-page">
        <div className="gradient-bg" style={{ pointerEvents: 'none' }} />
        <motion.div 
          className="auth-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="auth-title">Crear Cuenta</h1>
          
          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleRegister} className="auth-form">
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
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </motion.button>
          </form>
          
          <div className="auth-footer">
            <p>
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="auth-link">
                Inicia sesión
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default RegisterPage;
