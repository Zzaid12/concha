import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/router';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Verificar si el perfil está completo
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error('Error al obtener el perfil:', profileError);
          return;
        }
        
        setIsProfileComplete(profile?.is_complete || false);
        setUserRole(profile?.role || null);
      }
    } catch (err) {
      console.error('Error al verificar el usuario:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
      setIsProfileComplete(false);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className={scrolled ? 'scrolled' : ''} style={{ zIndex: 50 }}>
      <nav>
        <Link href="/" className="logo">
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            JobMatch
          </motion.span>
        </Link>

        <div className="nav-links">
          {user ? (
            <>
              <Link href="/jobs" className="nav-link">
                Ver Ofertas
              </Link>
              {userRole === 'admin' && (
                <Link href="/admin" className="nav-link">
                  Panel de Admin
                </Link>
              )}
              <div className="nav-right">
                {!isProfileComplete && (
                  <Link href="/profile" className="nav-link warning">
                    <span className="warning-icon">⚠️</span>
                    Completar Perfil
                  </Link>
                )}
                <Link href="/profile" className="nav-button secondary">
                  Mi Perfil
                </Link>
                <motion.button
                  onClick={handleLogout}
                  className="nav-button outline"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cerrar Sesión
                </motion.button>
              </div>
            </>
          ) : (
            <div className="nav-right">
              <Link href="/login" className="nav-button secondary">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="nav-button primary">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
