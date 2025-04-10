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
  const [name, setName] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;

      // Crear perfil inicial
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              full_name: name,
              email: email,
              is_complete: false,
            },
          ]);

        if (profileError) throw profileError;
      }

      setMessage('¡Registro exitoso! Por favor, verifica tu correo electrónico.');
      router.push('/login');
    } catch (err) {
      console.error("Registration error:", err);
      setMessage('Error al registrar. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Registro | Proyecto Marketing</title>
        <meta name="description" content="Regístrate en Proyecto Marketing" />
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
            <div className={`message error`}>
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
            
            <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
